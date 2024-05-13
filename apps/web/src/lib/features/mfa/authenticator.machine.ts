import { VerifyAuthAction } from "@app/shared";
import { setup, assign, fromPromise } from "xstate";

export type SelectedVerificationType = "email" | "securityKey";

const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const authenticatorMachine = setup({
  types: {
    input: {} as {
      email: string;
      action: VerifyAuthAction;
    },
    context: {
      hasVerifiedEmail: true,
      hasSecurityKey: false,
      selectedVerification: "email",
      action: undefined,
    } as {
      hasSecurityKey: boolean;
      hasVerifiedEmail: boolean;
      selectedVerification: SelectedVerificationType;
      action?: VerifyAuthAction;
    },
    events: {} as
      | { type: "Cancel" }
      | { type: "Reset" }
      | { type: "Verify" }
      | { type: "Continue" }
      | { type: "Selection.Update"; value: SelectedVerificationType }
      | { type: "Clicked Link" }
      | { type: "Resend Email" }
      | { type: "Save Backup Code" },
  },
  actors: {
    sendEmailVerification: fromPromise(async ({ input }) => {
      console.log("Sending email verification...");
      await wait(3000);
      console.log("done", input);

      return {
        success: true,
      };
    }),
  },
  guards: {
    hasSecurityKey: function ({ context }) {
      return context.hasSecurityKey;
    },
    hasVerifiedEmail: function ({ context }) {
      return context.hasVerifiedEmail;
    },
  },
  schemas: {
    events: {
      Cancel: {
        type: "object",
        properties: {},
      },
      Verify: {
        type: "object",
        properties: {},
      },
      "Selection.Update": {
        type: "object",
        properties: {},
      },
      Continue: {
        type: "object",
        properties: {},
      },
      Reset: {
        type: "object",
        properties: {},
      },
      "Clicked Link": {
        type: "object",
        properties: {},
      },
      "Resend Email": {
        type: "object",
        properties: {},
      },
      "Save Backup Code": {
        type: "object",
        properties: {},
      },
    },
  },
}).createMachine({
  context: ({ input }) => ({
    email: input.email,
    action: input.action,
    hasSecurityKey: false,
    hasVerifiedEmail: true,
    selectedVerification: "email",
  }),
  id: "Auth Challenge",
  initial: "Verification Required",
  on: {
    Reset: {
      target: ".Verification Required",
    },
  },
  states: {
    "Verification Required": {
      on: {
        "Selection.Update": {
          actions: assign({
            selectedVerification: ({ event }) => event.value,
          }),
        },
        Continue: [
          {
            target: "Todo",
            guard: {
              type: "hasSecurityKey",
            },
          },
          {
            target: "Sending Email",
            guard: {
              type: "hasVerifiedEmail",
            },
          },
          {
            target: "Verify Email",
          },
        ],
      },
    },
    Todo: {},
    "Sending Email": {
      invoke: {
        id: "sendingEmail",
        src: "sendEmailVerification",
        input: ({ context: { email } }) => ({ email }),
        onDone: {
          target: "Waiting For Email",
          // actions: assign({ user: ({ event }) => event.output }),
        },
      },
    },
    "Waiting For Email": {
      on: {
        "Resend Email": {
          target: "Sending Email",
        },
        "Clicked Link": {
          target: "Setup Authenticator",
        },
      },
    },
    "Verify Email": {
      on: {
        Verify: {
          target: "Waiting For Email",
        },
      },
    },
    "Setup Authenticator": {
      on: {
        Continue: {
          target: "Waiting for Code",
        },
        Cancel: {
          target: "Verification Required",
        },
      },
    },
    "Waiting for Code": {},
    "Code Success": {
      on: {
        "Save Backup Code": {
          target: "Success",
        },
      },
    },
    Success: {
      type: "final",
    },
  },
});
