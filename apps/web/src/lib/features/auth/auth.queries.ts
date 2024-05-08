import { fetchWrapper } from "@/lib/fetch";
import { apiRoutes, getApiRoute } from "../../api-routes";

export const getCurrentUser = async (opts: RequestInit = {}): Promise<any> => {
  const res = await fetchWrapper(getApiRoute(apiRoutes.users.me), {
    method: "GET",
    credentials: "include",
    ...opts,
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("Something went wrong");
  }

  return res.json();
};
