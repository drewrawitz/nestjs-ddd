const PREFIX = "/v1";

export const apiRoutes = {
  auth: {
    login: `${PREFIX}/auth/login`,
    loginMfa: `${PREFIX}/auth/login/mfa`,
    logout: `${PREFIX}/auth/logout`,
    challenge: {
      initiate: `${PREFIX}/auth/challenge/initiate`,
    },
  },
  users: {
    me: `${PREFIX}/users/me`,
  },
};

export const getApiRoute = (
  route: string,
  params?: [string, string | number][],
): string => {
  let str = `http://localhost:3000${route}`;

  params?.forEach(([key, value]) => {
    str = str.replace(key, value.toString());
  });

  return str;
};
