import LoginPageSkeleton from "@/components/skeletons/login-page-skeleton";
import React from "react";

type Props = {};

const loading = (props: Props) => {
  return <LoginPageSkeleton />;
};

export default loading;
