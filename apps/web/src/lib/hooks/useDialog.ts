import { create } from "zustand";

type DialogType = "AddAuthenticatorApp" | "RemoveAuthenticatorApp";

interface DialogState {
  isOpen: boolean;
  dialogType: DialogType | null;
  data: any;
  onCloseHandler: (() => void) | null;
  openDialog: (
    type: DialogType,
    options?: { data?: any; onCloseHandler?: () => void },
  ) => void;
  closeDialog: () => void;
}

export const useDialog = create<DialogState>((set) => ({
  isOpen: false,
  dialogType: null,
  data: {},
  onCloseHandler: null,
  openDialog: (type, options = {}) =>
    set({
      isOpen: true,
      dialogType: type,
      data: options.data || {},
      onCloseHandler: options.onCloseHandler || null,
    }),
  closeDialog: () =>
    set((state) => {
      if (state.onCloseHandler) {
        state.onCloseHandler();
      }
      return {
        isOpen: false,
        dialogType: null,
        data: {},
        onCloseHandler: null,
      };
    }),
}));
