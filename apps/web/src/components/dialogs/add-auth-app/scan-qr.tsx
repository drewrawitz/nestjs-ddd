"use client";

import { Button } from "@/components/ui/button";
import { AddAuthenticatorAppContext } from "@/app/providers";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

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
      {isScanningQR ? (
        <Image
          src={state.context.qrCode}
          alt="Scan QR"
          width={180}
          height={180}
          className="max-w-[300px] mx-auto"
        />
      ) : (
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          {state.context.manualCode}
        </div>
      )}
      <Button
        type="button"
        variant="link"
        onClick={() => send({ type: "toggleMethod" })}
      >
        {isScanningQR ? "Enter code manually instead" : "Scan QR code instead"}
      </Button>
      <DialogFooter className="border-t pt-4">
        <DialogClose asChild>
          <Button type="button" variant="ghost">
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          onClick={() => send({ type: "continue" })}
          disabled={!state.can({ type: "continue" })}
        >
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}
