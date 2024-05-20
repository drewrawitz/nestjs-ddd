"use client";

import { useState, useEffect } from "react";
import { Icons } from "./icons";

function AuthChallengeVerified() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      clearInterval(timer);
      window.close();
    }

    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="text-center px-4">
      <Icons.spinner className="h-10 w-10 animate-spin mx-auto mb-4" />
      <p>
        We are good to go! Please return to the original tab. This page will try
        to automatically close in {countdown} seconds.
      </p>
    </div>
  );
}

export default AuthChallengeVerified;
