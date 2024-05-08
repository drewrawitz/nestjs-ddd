"use server";

import { redirect } from "next/navigation";

export const fetchWrapper = async (url: string, opts: RequestInit) => {
  const res = await fetch(url, opts);

  if (res.status === 401) {
    // Delete the `connect.sid` cookie
    if (typeof window !== "undefined") {
      // Browser context
      document.cookie =
        "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    } else {
      redirect("/login");
    }
  }

  return res;
};
