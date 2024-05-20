"use client";

import { useDialog } from "@/lib/hooks/useDialog";
import AddAuthenticatorAppDialog from "./add-auth-app/add-auth-app.dialog";
import { Dialog } from "@/components/ui/dialog";

const GlobalDialog = () => {
  const { isOpen, dialogType, closeDialog } = useDialog();

  const renderDialogContent = () => {
    switch (dialogType) {
      case "AddAuthenticatorApp":
        return <AddAuthenticatorAppDialog />;
      default:
        return null;
    }
  };

  return (
    <Dialog onOpenChange={closeDialog} open={isOpen}>
      {renderDialogContent()}
    </Dialog>
  );
};

export default GlobalDialog;
