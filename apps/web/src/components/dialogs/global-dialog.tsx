"use client";

import { AddAuthenticatorAppContext } from "@/app/providers";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDialog } from "@/lib/hooks/useDialog";
import { VerificationRequiredDialog } from "./verification-required";
import { useSelector } from "@xstate/react";

function GlobalDialog() {
  const { isOpen, onClose } = useDialog();
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const state = useSelector(actorRef, (state) => state);

  return (
    <Dialog onOpenChange={onClose} open={isOpen} defaultOpen={isOpen}>
      <DialogContent>
        {(state.matches("verificationRequired") ||
          state.matches("sendingEmail")) && <VerificationRequiredDialog />}
      </DialogContent>
    </Dialog>
  );
}

export default GlobalDialog;
