"use client";
import SaveButton from "@/components/Buttons/SaveButton";
import { Loader2 } from "lucide-react";
import { signIn, SignInResponse, useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const LoginContainer = () => {
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

  if (session) {
    redirect("/dashboard/overview");
  }

  return (
    <div className="w-full flex flex-col py-12 mb-10 items-center min-h-fit h-screen">
      <div className=" flex justify-between text-primary  absolute top-0 left-0 right-0 p-4">
        <Link href={"/"}>
          <h1 className="text-primary font-medium xxs:px-4">Brett</h1>
        </Link>
      </div>
      <div className="w-[90%] flex flex-col justify-center items-center">
        <div className="w-full md:w-1/2 mx-auto justify-center items-center shadow-lg rounded-lg p-4 xs:p-12 mt-6 bg-white ">
          <h3 className="font-normal">Log in to your account</h3>
          <div className="pt-8">
            <button
              onClick={(e) => onSignIn(e, "google")}
              disabled={isGoogleLoading}
              className=" flex justify-center items-center w-full p-4 rounded-md bg-white border border-primary hover:shadow-xl transition-all ease-in-out"
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
              Google
            </button>
          </div>
          <div className="divider my-6">
            <h5 className="my-3">OR</h5>
          </div>
          <form>
            <div className="flex flex-col">
              <label
                className="beer-card__label-text text-primary!"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="form-input__create-account"
                type="email"
                placeholder="Email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label
                className="beer-card__label-text text-primary!"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="form-input__create-account"
                type="password"
                placeholder="Password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {loginError && (
              <div className="error ml-3 text-xs">{loginError}</div>
            )}
          </form>
          <SaveButton
            isLoading={isCreateLoading}
            title="Log in"
            className="create-btn bg-accent! text-primary! my-6 w-full "
            onClick={(e) => onSignIn(e, "credentials")}
          />
          <div className="text-sm inline-flex gap-2 justify-center w-full">
            <p className="m-0 ">Don&rsquo;t have an account?</p>

            <span className="link link-accent">
              <Link
                href={`/auth/create/account${
                  acceptInviteUrl ? `?next=${acceptInviteUrl}` : ""
                }`}
              >
                Sign up here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginContainer;
