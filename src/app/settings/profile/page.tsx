import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Brewery } from "@/app/types/brewery";
import getBreweries from "@/lib/getBreweries";
import { getServerSession } from "next-auth/next";
import Image from "next/image";

import BrewerySettingsList from "@/components/Settings/BrewerySettingsList";

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
        <Image
          src={session?.user.picture}
          alt={`profile picture of ${session?.user.name}`}
          className="mask mask-squircle"
          width={100}
          height={100}
        />
        <div>
          <p className="gray-text">{constructUserName(session?.user.name)}</p>

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
