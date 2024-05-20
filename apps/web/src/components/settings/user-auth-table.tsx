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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUserQuery } from "@/lib/features/auth/auth.hooks";
import { MFAType } from "@app/prisma/client";
import { formattedDate } from "@app/shared";

const mfaMapping = {
  [MFAType.TOTP]: "Authenticator app",
};

export default function UserAuthTable() {
  const { data: user } = useCurrentUserQuery();

  return (
    <>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-32"
                        align="end"
                        forceMount
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuItem className="cursor-pointer text-red-600">
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        )}
      </Table>
      {user?.mfa && user?.mfa?.length > 0 && (
        <p className="mt-6 text-gray-300 text-sm text-center">
          If you lose your mobile device or security key, you can{" "}
          <button className="text-amber-600 hover:underline">
            generate a backup code
          </button>{" "}
          to sign in to your account.
        </p>
      )}
    </>
  );
}
