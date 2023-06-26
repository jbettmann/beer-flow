import dbConnect from "@/lib/db";
import User from "../../models/user";

async function getUser(email: string) {
  await dbConnect();

  return await User.findOne({ email });
}

export default getUser;
