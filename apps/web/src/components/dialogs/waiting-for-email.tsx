"use client";

import { AddAuthenticatorAppContext } from "@/app/providers";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WaitingForEmailDialog() {
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const state = actorRef.getSnapshot();

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
      </DialogFooter>
    </>
  );
}
