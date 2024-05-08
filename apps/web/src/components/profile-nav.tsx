"use client";

import { useCurrentUserQuery } from "@/lib/features/auth/auth.hooks";

export default function ProfileNav() {
  const { data } = useCurrentUserQuery();
  console.log(data);

  return <div>{data?.email}</div>;
}
