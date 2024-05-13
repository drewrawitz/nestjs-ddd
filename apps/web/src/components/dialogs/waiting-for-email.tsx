"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthenticatorMachineContext } from "@/lib/features/mfa/authenticator.hooks";

export function WaitingForEmailDialog() {
  const [state, send] = useAuthenticatorMachineContext();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Click the link in your email</DialogTitle>
        <DialogDescription>
          To continue, please use this browser to click the link sent to{" "}
          {state.context.email} while keeping this page open. This page will
          automatically update once you do so.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost">
            Cancel
          </Button>
        </DialogClose>
        <Button type="button" onClick={() => send({ type: "Clicked Link" })}>
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}
