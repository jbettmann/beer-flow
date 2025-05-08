"use client";

import LoginContainer from "@/components/layout/login-container";
import LoginPageSkeleton from "@/components/skeletons/login-page-skeleton";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginContainer />
    </Suspense>
  );
}
