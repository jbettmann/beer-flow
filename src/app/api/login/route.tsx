import dbConnect from "@/lib/db";
import { signJwtAccessToken } from "@/lib/jwt";

import * as bcyrpt from "bcrypt";
import User from "../../../../models/user";

interface RequestBody {
  email: string;
  password: string;
}

export async function POST(req: Request, res: Response) {
  console.log("running login");

  try {
    const body: RequestBody = await req.json();

    await dbConnect();

    const user = await User.findOne({ email: body.email });

    if (user) {
      const password = user.get("password");

      const isPasswordValid = await bcyrpt.compare(body.password, password);

      if (isPasswordValid) {
        const { password, ...userWithoutPassword } = user;

        const result = {
          ...userWithoutPassword,
        };
        return new Response(JSON.stringify(result));
      } else {
        return new Response(
          JSON.stringify({
            message: "Invalid password",
          })
        );
      }
    } else {
      return new Response(
        JSON.stringify({
          message: "User not found",
        })
      );
    }
  } catch (error) {
    console.error("Error handling POST request:", error);
    return new Error(JSON.stringify(error));
  }
}
