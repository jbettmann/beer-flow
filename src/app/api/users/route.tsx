import axios from "axios";

interface RequestBody {
  fullName: string;
  username: string;
  password: string;
  email: string;
}

export async function POST(req: Request) {
  try {
    const user = await axios.post(
      "https://beer-bible-api.vercel.app/users",
      req.body
    );
    return new Response(JSON.stringify(user.data)); // Return the created user data
  } catch (error) {
    console.log(error);
    throw new Error(JSON.stringify(error));
  }
}
