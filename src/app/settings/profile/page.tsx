import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Brewery } from "@/app/types/brewery";
import getBreweries from "@/lib/getBreweries";
import { getServerSession } from "next-auth/next";
import Image from "next/image";

import BrewerySettingsList from "@/components/Settings/BrewerySettingsList";
import { getInitials } from "@/lib/utils";

type Props = {};

const ActualProfilePage = async (props: Props) => {
  const session = await getServerSession(authOptions);
  const breweries = await getBreweries();

  const constructUserName = (name: string) => {
    const nameArray = name.split(" ");
    const firstName = nameArray[0].toLowerCase();
    const lastName = nameArray[1].toLowerCase();
    return `@${lastName}.${firstName}`;
  };
  return (
    // Profile info
    <div>
      <div className="settings-profile__info">
        {session?.user.picture ? (
          <Image
            src={session?.user.picture as string}
            alt={`profile picture of ${session?.user.name}`}
            className="mask mask-squircle"
            width={100}
            height={100}
          />
        ) : (
          <div className=" flex px-1 py-[.5px] bg-accent justify-center items-center text-primary font-bold text-3xl rounded-full w-24 h-24">
            {getInitials(session?.user.fullName || "")}
          </div>
        )}
        <div className="text-center xs:text-left">
          <p className="gray-text">
            {constructUserName(
              session?.user.name || (session?.user.fullName as string)
            )}
          </p>

          <p className="gray-text">{session?.user.email}</p>
        </div>
      </div>

      <div className="divider border-gray-50"></div>
      {/* Breweries */}
      <div>
        <h4>Breweries</h4>
        {breweries.map((brewery: Brewery) => (
          <BrewerySettingsList
            key={brewery._id}
            brewery={brewery}
            session={session}
          />
        ))}
      </div>
    </div>
  );
};

export default ActualProfilePage;
