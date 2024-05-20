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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Icons } from "../icons";
import { AddAuthenticatorAppContext } from "@/app/providers";

export function VerificationRequiredDialog() {
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const { send } = actorRef;
  const state = actorRef.getSnapshot();

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
        <RadioGroup defaultValue="email" className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email">Receive a link in your email</Label>
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
          onClick={() => send({ type: "continue" })}
          disabled={!state.can({ type: "continue" })}
        >
          {state.matches("sendingEmail") && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}
