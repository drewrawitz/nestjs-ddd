import ProfileNav from "@/components/profile-nav";
import { getHeaderInfo } from "@/lib/cookies";
import { getCurrentUser } from "@/lib/features/auth/auth.queries";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const { headers } = getHeaderInfo();

  const user = await getCurrentUser({
    headers,
  });
  queryClient.setQueryData(["me"], user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container">
        <div className="border-b">
          <div className="flex items-center px-4">
            <div className="w-[100px] py-4">Logo</div>
            <div className="ml-auto flex items-center space-x-4">
              <ProfileNav />
            </div>
          </div>
        </div>
        <div className="py-6">{children}</div>
      </div>
    </HydrationBoundary>
  );
}
