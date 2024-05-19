"use client";

import { Ellipsis } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { useCurrentUserQuery } from "@/lib/features/auth/auth.hooks";
import { MFAType } from "@app/prisma/client";
import { formattedDate } from "@app/shared";

const mfaMapping = {
  [MFAType.TOTP]: "Authenticator app",
};

export default function UserAuthTable() {
  const { data: user } = useCurrentUserQuery();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Method</TableHead>
          <TableHead>Date added</TableHead>
          <TableHead className=""></TableHead>
        </TableRow>
      </TableHeader>
      {user?.mfa && user?.mfa.length < 1 ? (
        <TableCaption>
          You don&apos;t have any authentication methods added.
        </TableCaption>
      ) : (
        <TableBody>
          {user?.mfa.map((m) => {
            return (
              <TableRow key={m.type}>
                <TableCell className="font-medium">
                  {mfaMapping[m.type] ?? "—"}
                </TableCell>
                <TableCell>{formattedDate(m.createdAt)}</TableCell>
                <TableCell className="text-right flex items-center justify-end">
                  <Ellipsis />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      )}
    </Table>
  );
}
