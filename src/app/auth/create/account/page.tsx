import { redirect } from "next/navigation";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const CreateAccountPage = ({ searchParams }: Props) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams || {})) {
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
