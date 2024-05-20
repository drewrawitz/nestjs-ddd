import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { login, loginMFA, logout } from "./auth.mutations";
import { getCurrentUser } from "./auth.queries";

type LoginParams = {
  email: string;
  password: string;
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => getCurrentUser(),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 0,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: LoginParams) => {
      return login(email, password);
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(["me"], data);
    },
  });
}

export function useLoginMfaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginMFA,
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: async () => {
      await queryClient.resetQueries({
        queryKey: ["me"],
      });
      router.push("/login");
    },
  });
}
