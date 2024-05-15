"use client";

import Add2faButton from "@/components/add-2fa-button";
import UserAuthTable from "./user-auth-table";

function TwoStepAuth() {
  return (
    <>
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-medium">Two-step authentication</h1>
          <p className="text-gray-400">
            Increase security for your account by using multiple authentication
            methods.
          </p>
        </div>
        <Add2faButton />
      </div>
      <UserAuthTable />
    </>
  );
}

export default TwoStepAuth;
