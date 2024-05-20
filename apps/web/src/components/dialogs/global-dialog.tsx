"use client";

import { AddAuthenticatorAppContext } from "@/app/providers";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDialog } from "@/lib/hooks/useDialog";
import { VerificationRequiredDialog } from "./verification-required";
import { useSelector } from "@xstate/react";
import { WaitingForEmailDialog } from "./waiting-for-email";
import { ScanQRDialog } from "./scan-qr";
import { EnterTotpCode } from "./enter-totp-code";
import { SaveBackupCodeDialog } from "./save-backup-code";
import { AuthenticatorSuccessDialog } from "./success";

function GlobalDialog() {
  const { isOpen, onClose } = useDialog();
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const state = useSelector(actorRef, (state) => state);

  const onDialogClose = () => {
    actorRef.send({ type: "close" });
    onClose();
  };

  return (
    <Dialog onOpenChange={onDialogClose} open={isOpen} defaultOpen={isOpen}>
      <DialogContent>
        {(state.matches("verificationRequired") ||
          state.matches("sendingEmail")) && <VerificationRequiredDialog />}
        {state.matches("waiting") && <WaitingForEmailDialog />}
        {(state.matches("scanQR") || state.matches("manualCode")) && (
          <ScanQRDialog />
        )}
        {(state.matches("enterTotp") || state.matches("submitting")) && (
          <EnterTotpCode />
        )}
        {state.matches("success") && <SaveBackupCodeDialog />}
        {state.matches("done") && <AuthenticatorSuccessDialog />}
      </DialogContent>
    </Dialog>
  );
}

export default GlobalDialog;
