import { apiRoutes, getApiRoute } from "../../api-routes";
import { IUserResponse } from "@app/shared";

export const getCurrentUser = async (
  opts: RequestInit = {},
): Promise<IUserResponse> => {
  const res = await fetch(getApiRoute(apiRoutes.users.me), {
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

  const data = await res.json();
  return data;
};
