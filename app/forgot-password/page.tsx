"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeftIcon, MailIcon } from "lucide-react";

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
import { AuthContainer } from "@/components/ui/auth-container";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-provider";

// Form schema with validation
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const { error } = (await requestPasswordReset(values.email)) || {};

    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: error.message,
      });
    } else {
      setIsSuccess(true);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
      });
    }
  }

  if (isSuccess) {
    return (
      <div className="container flex h-screen max-w-sm flex-col justify-center">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to your email address.
          </p>
        </div>
        <div className="mt-4 flex flex-col space-y-4">
          <p className="px-8 text-center text-sm text-muted-foreground">
            Please check your email for a reset link. If you don&apos;t see it,
            check your spam folder.
          </p>
          <Button variant="outline" asChild>
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthContainer>
      <div className="container flex h-screen max-w-sm flex-col justify-center">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Forgot password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="grid gap-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending reset link...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4" />
                    Send reset link
                  </div>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </AuthContainer>
  );
}
