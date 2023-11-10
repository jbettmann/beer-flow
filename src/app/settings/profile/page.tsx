import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Brewery } from "@/app/types/brewery";
import getBreweries from "@/lib/getBreweries";
import { getServerSession } from "next-auth/next";
import Image from "next/image";

import BrewerySettingsList from "@/components/Settings/BrewerySettingsList";
import { getInitials } from "@/lib/utils";
import UpdateUserPhoto from "@/components/UpdateUserInfo/UpdateUserPhoto";

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
        <UpdateUserPhoto user={session?.user!} />
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
            session={session as any}
          />
        ))}
      </div>
    </div>
  );
};

export default ActualProfilePage;
