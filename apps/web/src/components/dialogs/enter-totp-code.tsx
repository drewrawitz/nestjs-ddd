"use client";

import { Button } from "@/components/ui/button";
import { AddAuthenticatorAppContext } from "@/app/providers";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function EnterTotpCode() {
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const { send } = actorRef;
  const state = actorRef.getSnapshot();

  return (
    <>
      <DialogHeader className="space-y-4">
        <DialogTitle>Use an authenticator app</DialogTitle>
        <DialogDescription>
          Please enter your 6-digit authentication code from your authenticator
          app.
        </DialogDescription>
      </DialogHeader>
      <div>
        <InputOTP
          maxLength={6}
          autoFocus
          containerClassName="justify-center"
          value={state.context.totp}
          onChange={(value) => send({ type: "totpInput", value })}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <DialogFooter className="border-t pt-4 mt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => send({ type: "back" })}
        >
          Go back
        </Button>
        <Button
          type="button"
          onClick={() => send({ type: "submit" })}
          disabled={!state.can({ type: "submit" })}
        >
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}
