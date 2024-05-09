"use client";

import { Icons } from "./icons";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/lib/features/auth/auth.hooks";
import { useState } from "react";
import TotpLogin from "./totp-login";
import { MFAType } from "@app/prisma/client";
import { AlertError } from "./alert-error";

const FormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string(),
});

export function LoginForm() {
  const [view, setView] = useState<"login" | "totp">("login");
  const [tempKey, setTempKey] = useState("");
  const router = useRouter();
  const login = useLoginMutation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const res = await login.mutateAsync({
      email: data.email,
      password: data.password,
    });

    if (res.type === "MFA_REQUIRED") {
      // TODO: The user should choose which method they want to authenticate with if there is more than one value in this Array.
      if (res.mfaTypes.includes(MFAType.TOTP)) {
        setView("totp");
        setTempKey(res.tempKey);
      }
    }

    if (res.type === "LOGIN_SUCCESS") {
      router.push("/");
    }
  }

  if (view === "totp") {
    return <TotpLogin tempKey={tempKey} />;
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight mb-6">
        Sign in to your account
      </h1>
      {login.isError && (
        <div className="mb-4">
          <AlertError message={login.error.message} />
        </div>
      )}

      <Form {...form}>
        <form
          method="POST"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            size="xl"
            disabled={login.isPending}
          >
            {login.isPending && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign in
          </Button>
        </form>
      </Form>
    </div>
  );
}
