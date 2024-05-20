"use client";

import { useEffect } from "react";
import { useDialog } from "@/lib/hooks/useDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddAuthenticatorAppContext } from "@/app/providers";
import { useCurrentUserQuery } from "@/lib/features/auth/auth.hooks";
import { MFAType } from "@app/prisma/client";

function Add2faButton() {
  const { data: user } = useCurrentUserQuery();
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Add authentication method</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={addAuthenticatorApp}
            disabled={user?.mfa?.some((t) => t.type === MFAType.TOTP)}
          >
            Use an authenticator app
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Add2faButton;
