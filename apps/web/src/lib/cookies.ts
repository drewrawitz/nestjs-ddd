import { cookies } from "next/headers";

export const getHeaderInfo = () => {
  const cookieName = "connect.sid";
  const nextCookies = cookies(); // Get cookies object
  const token = nextCookies.get(cookieName); // Find cookie

  return {
    token,
    headers: {
      ...(token?.value && {
        Cookie: `${token.name}=${token.value}`,
      }),
    },
  };
};
