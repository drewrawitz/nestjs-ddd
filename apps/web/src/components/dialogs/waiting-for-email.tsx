"use client";

import { AddAuthenticatorAppContext } from "@/app/providers";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icons } from "../icons";
import { useSocket } from "@/lib/providers/socket.provider";
import { useEffect } from "react";
import { VerifyAuthAction } from "@app/shared";

const socketName = `authChallengeVerified.${VerifyAuthAction.AddAuthenticatorApp}`;

export function WaitingForEmailDialog() {
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const state = actorRef.getSnapshot();
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      const handleAuthChallengeVerified = () => {
        actorRef.send({ type: "verified" });
      };

      socket.on(socketName, handleAuthChallengeVerified);

      return () => {
        socket.off(socketName, handleAuthChallengeVerified);
      };
    }
  }, [socket]);

  return (
    <>
      <DialogHeader className="space-y-4">
        <DialogTitle>Click the link in your email</DialogTitle>
        <div className="flex items-center justify-center">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
        <DialogDescription>
          To continue, please use this browser to click the link sent to{" "}
          {state.context.email} while keeping this page open. This page will
          automatically update once you do so.
        </DialogDescription>
        <div className="flex items-center justify-center">
          <Button variant="outline">Resend link</Button>
        </div>
      </DialogHeader>
    </>
  );
}
