import { auth } from "@/auth";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

type Props = {};

const constructUserName = (name?: string | null) => {
  if (!name) {
    return "@beer-flow.user";
  }

  const nameArray = name.trim().split(/\s+/);
  const firstName = nameArray[0]?.toLowerCase() || "user";
  const lastName = nameArray[1]?.toLowerCase() || firstName;
  return `@${lastName}.${firstName}`;
};

const ActualProfilePage = async (props: Props) => {
  const session = await auth();
  const displayName = session?.user.fullName || session?.user.name;

  return (
    <section className="w-full max-w-3xl rounded-md border border-border bg-background p-6">
      <div>
        <h3 className="text-xl font-semibold">Profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal Beer Flow identity. Brewery settings live in the Brewery
          settings section.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        {session?.user.picture ? (
          <Image
            src={session.user.picture as string}
            alt={`profile picture of ${displayName}`}
            className="mask mask-squircle"
            width={100}
            height={100}
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent px-1 py-[.5px] text-3xl font-bold text-primary">
            {getInitials(displayName || "")}
          </div>
        )}
        <div className="text-center sm:text-left">
          <p className="text-lg font-medium">{displayName || "Not provided"}</p>
          <p className="text-sm text-muted-foreground">
            {constructUserName(displayName)}
          </p>
          <p className="text-sm text-muted-foreground">{session?.user.email}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border p-4">
          <p className="text-sm font-medium">Display name</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {displayName || "Not provided"}
          </p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="text-sm font-medium">Email address</p>
          <p className="mt-1 break-all text-sm text-muted-foreground">
            {session?.user.email}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ActualProfilePage;
