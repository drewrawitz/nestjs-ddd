"use client";

import { AddAuthenticatorAppContext } from "@/app/providers";
import { DialogContent } from "@/components/ui/dialog";
import { VerificationRequiredDialog } from "./verification-required";
import { useSelector } from "@xstate/react";
import { WaitingForEmailDialog } from "./waiting-for-email";
import { ScanQRDialog } from "./scan-qr";
import { EnterTotpCode } from "./enter-totp-code";
import { SaveBackupCodeDialog } from "./save-backup-code";
import { AuthenticatorSuccessDialog } from "./success";

function AddAuthenticatorAppDialog() {
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const state = useSelector(actorRef, (state) => state);

  return (
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
  );
}

export default AddAuthenticatorAppDialog;
