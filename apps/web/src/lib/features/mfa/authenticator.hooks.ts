import constate from "constate";
import { useActor } from "@xstate/react";
import { authenticatorMachine } from "./authenticator.machine";
import { useCurrentUserQuery } from "../auth/auth.hooks";
import { VerifyAuthAction } from "@app/shared";

export function useAuthenticatorMachine() {
  const { data } = useCurrentUserQuery();

  const actor = useActor(authenticatorMachine, {
    input: {
      email: data?.email,
      action: VerifyAuthAction.GenerateBackupCode,
    },
  });

  return actor;
}

export const [AuthenticatorMachineProvider, useAuthenticatorMachineContext] =
  constate(useAuthenticatorMachine);
