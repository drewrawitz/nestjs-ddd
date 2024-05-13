"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuthenticatorMachineContext } from "@/lib/features/mfa/authenticator.hooks";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SelectedVerificationType } from "@/lib/features/mfa/authenticator.machine";
import { Icons } from "../icons";

export function VerificationRequiredDialog() {
  const [state, send] = useAuthenticatorMachineContext();

  console.log("state", state);

  const onChangeRadio = (value: SelectedVerificationType) => {
    send({ type: "Selection.Update", value });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Verification required</DialogTitle>
        <DialogDescription>
          To make changes to your account, verify using one of the options
          below.
        </DialogDescription>
      </DialogHeader>
      <div>
        <RadioGroup
          defaultValue="email"
          className="space-y-2"
          onValueChange={onChangeRadio}
        >
          {state.context.hasSecurityKey && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="securityKey" id="securityKey" />
              <Label htmlFor="securityKey">
                Use a security key or Touch ID
              </Label>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email">
              Receive a link in your email + more verification
            </Label>
          </div>
        </RadioGroup>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost">
            Close
          </Button>
        </DialogClose>
        <Button
          type="button"
          onClick={() => send({ type: "Continue" })}
          disabled={state.matches("Sending Email")}
        >
          {state.matches("Sending Email") && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}
