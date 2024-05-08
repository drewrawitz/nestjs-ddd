import { useMutation } from "@tanstack/react-query";
import { login } from "./auth.mutations";

type LoginParams = {
  email: string;
  password: string;
};

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: LoginParams) => {
      return login(email, password);
    },
  });
}
