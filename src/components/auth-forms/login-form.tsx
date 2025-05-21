"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SaveButton from "@/components/Buttons/SaveButton";
import { Loader2 } from "lucide-react";
import { signIn, SignInResponse, useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<any>(null);
  const [acceptInviteUrl, setAcceptInviteUrl] = useState<string | null>(null);
  const next = searchParams.get("next");

  const onSignIn = async (e: any, provider: string) => {
    setLoginError(null);
    console.log(e, provider);
    try {
      if (provider === "google") {
        setIsGoogleLoading(true);
        const result = await signIn("google", {
          callbackUrl: acceptInviteUrl || "/dashboard/overview",
        });
        const res = result as unknown as SignInResponse;

        if (res?.error) {
          toast.error(res.error);
        }
        return;
      }

      if (provider === "credentials") {
        setIsCreateLoading(true);
        const login = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: acceptInviteUrl || "/dashboard/overview",
        });

        if (!login || !login.ok) {
          console.log("Login error!!!:", login);
          setLoginError(login?.error?.split(":")[1]);
          setIsCreateLoading(false);
          toast.error(
            "There was an error logging in. Please check your credentials and try again."
          );
          redirect("/auth/login");
        }

        sessionStorage.setItem("credentialsLogin", "true");
        redirect(acceptInviteUrl || "/dashboard/overview");
      }
    } catch (error: any) {
      setLoginError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (next) {
      setAcceptInviteUrl(next);
    }
  }, []);

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Welcome back! Please sign in to continue
        </p>
      </div>
      <div className="grid gap-6">
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={(e) => onSignIn(e, "google")}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg
              className="mr-2 h-6 w-6"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="github"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
          )}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            or
          </span>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button
          type="submit"
          className="w-full"
          onClick={(e) => onSignIn(e, "credentials")}
        >
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
