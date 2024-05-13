"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VerificationRequiredDialog } from "./dialogs/verification-required";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuthenticatorMachineContext } from "@/lib/features/mfa/authenticator.hooks";
import { WaitingForEmailDialog } from "./dialogs/waiting-for-email";

function Add2faButton() {
  const [state, send] = useAuthenticatorMachineContext();

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Wait for the dialog to close before resetting the state to prevent a flash of content updates
      // while the dialog is in the process of closing.
      setTimeout(() => {
        send({ type: "Reset" });
      }, 300);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {(state.matches("Verification Required") ||
          state.matches("Sending Email")) && <VerificationRequiredDialog />}
        {state.matches("Waiting For Email") && <WaitingForEmailDialog />}
      </DialogContent>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Add authentication method</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <DialogTrigger asChild>
                <button>Use an authenticator app</button>
              </DialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  );
}

export default Add2faButton;
