import { apiRoutes, getApiRoute } from "../../api-routes";

export const getCurrentUser = async (opts: RequestInit = {}): Promise<any> => {
  try {
    const res = await fetch(getApiRoute(apiRoutes.users.me), {
      method: "GET",
      credentials: "include",
      ...opts,
    });

    if (!res.ok) {
      throw new Error("Something went wrong");
    }

    return res.json();
  } catch (e) {
    throw new Error("Something went wrong");
  }
};
