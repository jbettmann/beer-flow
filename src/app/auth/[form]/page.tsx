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
        <div className="absolute top-5.5 left-5.5 flex justify-center items-center gap-2 md:justify-start z-20 text-3xl font-semibold text-primary-foreground">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image
              width={50}
              height={50}
              src="/brett_logo.png"
              alt="Brett Logo"
              // className="w-16"
            />
          </a>
          Brett
        </div>
        <Image
          src="/example.png"
          width={1000}
          height={1000}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale z-10"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
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
