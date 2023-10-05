import { Users } from "@/app/types/users";

export default async function sitemap() {
  const res = await fetch("https://beer-bible-api.vercel.app/users");
  const allUsers = (await res.json()) as Users[];

  const users = allUsers.map((brewery) => ({
    url: `http://localhost:3000/brewery/${brewery._id}`,
    lastModified: new Date().toISOString(),
  }));

  const routes = ["", "about", "beers", "login"].map((route) => ({
    url: `http://localhost:3000/${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [...routes, ...users];
}
