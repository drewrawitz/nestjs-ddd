"use client";

import ProfileNav from "@/components/profile-nav";
import { useCurrentUserQuery } from "@/lib/features/auth/auth.hooks";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = useCurrentUserQuery();

  if (!user?.id) {
    redirect("/login");
  }

  return (
    <div className="container">
      <div className="border-b">
        <div className="flex items-center px-4">
          <div className="w-[100px] py-4">
            <Link href="/">Logo</Link>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ProfileNav />
          </div>
        </div>
      </div>
      <div className="py-6">{children}</div>
    </div>
  );
}
