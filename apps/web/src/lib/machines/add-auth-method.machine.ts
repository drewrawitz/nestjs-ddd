import { assign, fromPromise, setup } from "xstate";

const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const submitTotpCode = fromPromise(async (data: any) => {
  console.log("submit totp code", data);
  return "123";
});

const sendEmail = fromPromise(async (data: any) => {
  console.log("Send Email", data);
  await wait(3000);
  console.log("Done");
  return "derp";
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
      | { type: "submit" },
  },
  actors: {
    submitTotpCode,
    sendEmail,
  },
}).createMachine({
  id: "Add an authenticator app",
  initial: "idle",
  context: {
    email: undefined,
    totp: "",
    backupCode: "",
    error: "",
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
          target: "scanQR",
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
        submit: {
          guard: ({ context }) => context.totp.length === 6,
          target: "submitting",
        },
      },
    },
    submitting: {
      invoke: {
        src: "submitTotpCode",
        onDone: {
          target: "success",
          actions: assign({
            backupCode: ({ event }) => event.output,
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
    closed: {},
    failure: {},
    success: {
      type: "final",
    },
  },
});
