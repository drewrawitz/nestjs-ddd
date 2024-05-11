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

export default function UserAuthTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Method</TableHead>
          <TableHead>Date added</TableHead>
          <TableHead className=""></TableHead>
        </TableRow>
      </TableHeader>
      <TableCaption>
        You don&apos;t have any authentication methods added.
      </TableCaption>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Authenticator app</TableCell>
          <TableCell>April 28, 2024</TableCell>
          <TableCell className="text-right flex items-center justify-end">
            <Ellipsis />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
