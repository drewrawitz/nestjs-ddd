import { useQuery, useMutation } from "@tanstack/react-query";
import { login } from "./auth.mutations";
import { getCurrentUser } from "./auth.queries";

type LoginParams = {
  email: string;
  password: string;
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: LoginParams) => {
      return login(email, password);
    },
  });
}
