"use client";

import { Button } from "@/components/ui/button";
import { AddAuthenticatorAppContext } from "@/app/providers";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUserQuery } from "@/lib/features/auth/auth.hooks";
import { useEffect } from "react";

export function SaveBackupCodeDialog() {
  const { refetch } = useCurrentUserQuery();
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const { send } = actorRef;
  const state = actorRef.getSnapshot();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <>
      <DialogHeader className="space-y-4">
        <DialogTitle>Save your backup code</DialogTitle>
        <DialogDescription>
          Save this emergency backup code and{" "}
          <strong>store it somewhere safe.</strong> If you lose your device,
          this code can be used to disable two-step authentication and access
          your account.
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">
        {state.context.backupCode}
      </div>
      <DialogFooter>
        <Button
          type="button"
          onClick={() => send({ type: "continue" })}
          disabled={!state.can({ type: "continue" })}
        >
          I have saved my backup code
        </Button>
      </DialogFooter>
    </>
  );
}
