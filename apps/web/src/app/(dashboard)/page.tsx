"use client";

import { Button } from "@/components/ui/button";
import { useDialog } from "@/lib/hooks/useDialog";
import { useEffect } from "react";
import { AddAuthenticatorAppContext } from "../providers";

export default function Dashboard() {
  const actorRef = AddAuthenticatorAppContext.useActorRef();
  const { onOpen } = useDialog();

  useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
      console.log("Value", snapshot.value);
    });

    return subscription.unsubscribe;
  }, [actorRef]);

  const addAuthenticatorApp = () => {
    actorRef.send({ type: "start" });
    onOpen();
  };

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>
      <Button onClick={addAuthenticatorApp}>Add Authenticator App</Button>
    </>
  );
}
