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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

function Add2faButton() {
  return (
    <Dialog>
      <VerificationRequiredDialog />
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
