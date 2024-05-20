import AuthChallengeVerified from "@/components/auth-challenge-verified";
import { Button } from "@/components/ui/button";
import { getHeaderInfo } from "@/lib/cookies";
import { verifyAuthChallenge } from "@/lib/features/auth/auth.mutations";
import Link from "next/link";

export default async function AuthChallenge({
  params,
}: {
  params: {
    token: string;
  };
}) {
  const { headers } = getHeaderInfo();

  const data = headers.Cookie
    ? await verifyAuthChallenge(
        {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        },
        {
          token: params.token,
        },
      )
    : {
        verified: false,
        action: null,
      };

  if (!data.verified) {
    return (
      <div className="text-center space-y-4 px-4 max-w-[700px] mx-auto">
        <h2 className="text-3xl font-bold tracking-tight">Whoops</h2>
        <p>
          Invalid token detected. Are you on the correct browser and device? Did
          you keep the Dashboard open? Did you open an old link?
        </p>
        <Button asChild variant="outline">
          <Link href="/" passHref>
            Return to App
          </Link>
        </Button>
      </div>
    );
  }

  return <AuthChallengeVerified />;
}
