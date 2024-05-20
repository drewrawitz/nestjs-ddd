import { AuthChallengeType, VerifyAuthAction } from "@app/shared";
import { assign, fromPromise, setup } from "xstate";
import {
  initiateAuthChallenge,
  mfaTotpActivate,
  mfaTotpSetup,
} from "../features/auth/auth.mutations";

const submitTotpCode = fromPromise(
  async ({
    input,
  }: {
    input: { key: string; totp: string; challengeToken: string };
  }) => {
    return await mfaTotpActivate({
      key: input.key,
      totp: input.totp,
      challengeToken: input.challengeToken,
    });
  },
);

const setupTotp = fromPromise(async () => {
  return await mfaTotpSetup();
});

const sendEmail = fromPromise(async () => {
  const { token } = await initiateAuthChallenge({
    type: AuthChallengeType.Email,
    action: VerifyAuthAction.AddAuthenticatorApp,
  });
  return token;
});

export const addAuthenticatorAppMachine = setup({
  types: {
    events: {} as
      | { type: "success"; backupCode: string }
      | { type: "close" }
      | { type: "start" }
      | { type: "continue" }
      | { type: "resendEmail" }
      | { type: "verified" }
      | { type: "toggleMethod" }
      | { type: "back" }
      | { type: "totpInput"; value: string }
      | { type: "submit" },
  },
  actors: {
    submitTotpCode,
    setupTotp,
    sendEmail,
  },
}).createMachine({
  id: "Add an authenticator app",
  initial: "idle",
  context: {
    totp: "",
    backupCode: "",
    error: "",
    qrCode: "",
    manualCode: "",
    challengeToken: "",
  },
  on: {
    close: {
      target: ".closed",
    },
  },
  states: {
    idle: {
      on: {
        start: {
          target: "verificationRequired",
        },
      },
    },
    verificationRequired: {
      on: {
        continue: {
          target: "sendingEmail",
        },
      },
    },
    sendingEmail: {
      invoke: {
        src: "sendEmail",
        onDone: {
          target: "waiting",
          actions: assign({
            challengeToken: ({ event }) => event.output,
          }),
        },
        onError: {
          target: "failure",
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },
    waiting: {
      on: {
        resendEmail: {
          target: "sendingEmail",
        },
        verified: {
          target: "settingUpTotp",
        },
      },
    },
    settingUpTotp: {
      invoke: {
        src: "setupTotp",
        onDone: {
          target: "scanQR",
          actions: assign({
            qrCode: ({ event }) => event.output.qrcode,
            manualCode: ({ event }) => event.output.key,
          }),
        },
        onError: {
          target: "failure",
        },
      },
    },
    scanQR: {
      on: {
        toggleMethod: {
          target: "manualCode",
        },
        continue: {
          target: "enterTotp",
        },
      },
    },
    manualCode: {
      on: {
        toggleMethod: {
          target: "scanQR",
        },
        continue: {
          target: "enterTotp",
        },
      },
    },
    enterTotp: {
      on: {
        totpInput: {
          actions: assign(({ event }) => {
            return {
              totp: event.value,
            };
          }),
        },
        back: {
          target: "scanQR",
        },
        submit: {
          guard: ({ context }) => context.totp.length === 6,
          target: "submitting",
        },
      },
    },
    submitting: {
      invoke: {
        src: "submitTotpCode",
        input: ({ context }) => ({
          totp: context.totp,
          key: context.manualCode,
          challengeToken: context.challengeToken,
        }),
        onDone: {
          target: "success",
          actions: assign({
            backupCode: ({ event }) => event.output.backupCode,
          }),
        },
        onError: {
          target: "enterTotp",
          actions: assign({
            error: ({ event }: any) => event.error.message,
            totp: "",
          }),
        },
      },
    },
    closed: {},
    failure: {},
    success: {
      on: {
        continue: {
          target: "done",
        },
      },
    },
    done: {
      type: "final",
    },
  },
});
