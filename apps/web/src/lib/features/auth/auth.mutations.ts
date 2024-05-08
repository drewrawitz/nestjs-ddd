import { apiRoutes, getApiRoute } from "../../api-routes";

export const login = async (email: string, password: string): Promise<any> => {
  try {
    const res = await fetch(getApiRoute(apiRoutes.auth.login), {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Something went wrong");
    }

    return res.json();
  } catch (e) {
    throw new Error("Something went wrong");
  }
};
