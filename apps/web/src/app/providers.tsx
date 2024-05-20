"use client";

import GlobalDialog from "@/components/dialogs/global-dialog";
import { addAuthenticatorAppMachine } from "@/lib/machines/add-auth-method.machine";
import { SocketProvider } from "@/lib/providers/socket.provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createActorContext } from "@xstate/react";

export const AddAuthenticatorAppContext = createActorContext(
  addAuthenticatorAppMachine,
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <AddAuthenticatorAppContext.Provider>
        {children}
        <GlobalDialog />
        <ReactQueryDevtools initialIsOpen={false} />
      </AddAuthenticatorAppContext.Provider>
    </SocketProvider>
  );
}
