import { apiRoutes, getApiRoute } from "../../api-routes";
import {
  ActivateTotpDto,
  AuthChallengeDto,
  LoginResponseDto,
  VerifyAuthChallengeDto,
  VerifyMfaDto,
} from "@app/shared";

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponseDto> => {
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
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (e) {
    throw e;
  }
};

export const loginMFA = async (body: VerifyMfaDto): Promise<void> => {
  try {
    const res = await fetch(getApiRoute(apiRoutes.auth.loginMfa), {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        ...body,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (e) {
    throw e;
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

export const initiateAuthChallenge = async (
  body: AuthChallengeDto,
): Promise<{ token: string }> => {
  try {
    const res = await fetch(getApiRoute(apiRoutes.auth.challenge.initiate), {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        ...body,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (e) {
    throw e;
  }
};

export const verifyAuthChallenge = async (
  opts: RequestInit = {},
  body: VerifyAuthChallengeDto,
): Promise<{
  verified: boolean;
  action: string | null;
}> => {
  try {
    const res = await fetch(getApiRoute(apiRoutes.auth.challenge.verify), {
      method: "POST",
      credentials: "include",
      ...opts,
      body: JSON.stringify({
        ...body,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (e) {
    return {
      verified: false,
      action: null,
    };
  }
};

export const mfaTotpSetup = async (
  opts: RequestInit = {},
): Promise<{
  key: string;
  url: string;
  qrcode: string;
}> => {
  try {
    const res = await fetch(getApiRoute(apiRoutes.auth.mfa.totp.setup), {
      method: "POST",
      credentials: "include",
      ...opts,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (e) {
    throw e;
  }
};

export const mfaTotpActivate = async (
  body: ActivateTotpDto,
): Promise<{
  backupCode: string;
}> => {
  const res = await fetch(getApiRoute(apiRoutes.auth.mfa.totp.activate), {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      ...body,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
};
