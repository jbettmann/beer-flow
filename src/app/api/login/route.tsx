import dbConnect from "@/lib/db";
import { signJwtAccessToken } from "@/lib/jwt";

import * as bcyrpt from "bcrypt";
import User from "../../../../models/user";

interface RequestBody {
  email: string;
  password: string;
}

export async function POST(req: Request, res: Response) {
  try {
    const body: RequestBody = await req.json();

    await dbConnect();

    const user = await User.findOne({ email: body.email });

    if (user) {
      const isPasswordValid = await bcyrpt.compare(
        body.password,
        user.password
      );

      if (isPasswordValid) {
        const { password, ...userWithoutPassword } = user;

        const result = {
          ...userWithoutPassword,
        };
        return new Response(JSON.stringify(result));
      }
    }

    return new Response(JSON.stringify(null));
  } catch (error) {
    console.error("Error handling POST request:", error);
    return new Error(JSON.stringify(error));
  }
}
