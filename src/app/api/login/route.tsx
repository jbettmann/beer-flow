import { signJwtAccessToken } from "@/lib/jwt";
import mongo from "@/lib/mongodb";
import * as bcyrpt from "bcrypt";

interface RequestBody {
  username: string;
  password: string;
}

export async function POST(req: Request, res: Response) {
  try {
    const body: RequestBody = await req.json();

    const client = await mongo;
    const collection = client.db().collection("users");

    const user = await collection.findOne({ username: body.username });

    if (user) {
      const isPasswordValid = await bcyrpt.compare(
        body.password,
        user.password
      );

      if (isPasswordValid) {
        const { password, ...userWithoutPassword } = user;
        const accessToken = signJwtAccessToken(userWithoutPassword);
        const result = {
          ...userWithoutPassword,
          accessToken,
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
