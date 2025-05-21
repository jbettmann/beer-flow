import { redirect } from "next/navigation";
import Image from "next/image";
import { SignUpForm } from "@/components/auth-forms/sign-up-form";
import { LoginForm } from "@/components/auth-forms/login-form";

type Props = {
  params: {
    form: string;
  };
};

export default async function AuthPage({
  params,
}: {
  params: Promise<{ form: string }>;
}) {
  const form = (await params).form;

  const isLogin = form === "login";
  const isSignup = form === "signup";

  if (!isLogin && !isSignup) {
    redirect("/auth/login");
  }

  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/example.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale "
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image
              width={50}
              height={50}
              src="/Brett_Logo.svg"
              alt="Brett Logo"
              className="w-16"
            />
            Brett
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {isLogin && <LoginForm />}
            {isSignup && <SignUpForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
