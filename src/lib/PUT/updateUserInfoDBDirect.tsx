import dbConnect from "@/lib/db";
import User from "../../../models/user";
import { Users } from "@/types/users";

type Props = {
  userId: string | number;
  updatedUserInfo: Users | {};
};

const updateUserInfoDBDirect = async ({
  userId,
  updatedUserInfo,
}: Props): Promise<Users> => {
  await dbConnect();

  try {
    const existingUser = await User.findByIdAndUpdate(userId, updatedUserInfo, {
      new: true,
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    return existingUser;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user.");
  }
};

export default updateUserInfoDBDirect;
