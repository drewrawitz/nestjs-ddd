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

export const logout = async (opts: RequestInit = {}): Promise<void> => {
  try {
    const res = await fetch(getApiRoute(apiRoutes.auth.logout), {
      method: "POST",
      credentials: "include",
      ...opts,
    });

    if (!res.ok) {
      throw new Error("Logout failed");
    }

    return;
  } catch (err) {
    console.error("Error logging out:", err);
  }
};
