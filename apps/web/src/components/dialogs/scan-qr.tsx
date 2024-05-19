"use client";

import { Button } from "@/components/ui/button";
import { AddAuthenticatorAppContext } from "@/app/providers";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ScanQRDialog() {
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const { send } = actorRef;
  const state = actorRef.getSnapshot();
  const isScanningQR = state.matches("scanQR");

  return (
    <>
      <DialogHeader className="space-y-4">
        <DialogTitle>Set up two-step authentication</DialogTitle>
        <DialogDescription>
          Use a free authenticator app to scan this QR code to set up your
          account.
        </DialogDescription>
      </DialogHeader>
      {isScanningQR && (
        <img
          src={state.context.qrCode}
          alt="Scan QR"
          className="max-w-[300px] mx-auto"
        />
      )}
      <Button
        type="button"
        variant="link"
        onClick={() => send({ type: "toggleMethod" })}
      >
        {isScanningQR ? "Enter code manually instead" : "Scan QR code instead"}
      </Button>
    </>
  );
}
