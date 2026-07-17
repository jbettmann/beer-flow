import { sanitizeNextPath } from "@/lib/invite-flow";
import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const CreateAccountPage = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();
  const safeNext = sanitizeNextPath(
    typeof resolvedSearchParams?.next === "string"
      ? resolvedSearchParams.next
      : null,
    ""
  );

  if (safeNext) {
    params.set("next", safeNext);
  }

  for (const [key, value] of Object.entries(resolvedSearchParams || {})) {
    if (key === "next") {
      continue;
    }

    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    }
  }

  const query = params.toString();
  redirect(query ? `/auth/signup?${query}` : "/auth/signup");
};

export default CreateAccountPage;
