import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import jwt, { JwtPayload } from "jsonwebtoken";
import { signJwtAccessToken, signJwtRefreshToken } from "@/lib/jwt";
import type { NextAuthOptions } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import getUser from "@/lib/getUser";
import User from "../../../../../models/user";
import { Brewery } from "@/app/types/brewery";

export const authOptions: NextAuthOptions = {
  // pages: {
  //   signIn: "/auth/login",
  // },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        });
        const user = await res.json();
        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          console.log(user);
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],

  // An optional, but recommended, database for persisting user and session data
  // database: process.env.DATABASE_URL,
  // session: {
  //   jwt: true,
  // },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Persist the OAuth access_token and or the user id to the token right after signin

      if (trigger === "update" && session.newBreweryId) {
        token.breweries.push(session.newBreweryId) as string;
        return token;
      }

      if (user) {
        const accessToken = signJwtAccessToken(user); // creates accessToken for API authorization
        const refreshToken = signJwtRefreshToken(user); // sends for new accessToken after expires
        token.id = user.id;
        return {
          ...token,
          breweries: user.breweries,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      } // If the access token has expired, try to refresh it
      else if (token.accessToken && token.refreshToken) {
        try {
          jwt.verify(
            token.accessToken as string,
            process.env.NEXTAUTH_SECRET as string
          );
        } catch (e) {
          try {
            const { exp, ...rest } = jwt.verify(
              token.refreshToken as string,
              process.env.REFRESH_TOKEN_SECRET as string
            ) as JwtPayload & { exp?: number };
            // console.log("experation", exp, "Rest of Verify", rest);
            const newAccessToken = signJwtAccessToken(rest);

            token.accessToken = newAccessToken;
          } catch (err) {
            console.error("Error refreshing access token", err);

            return { ...token, error: "RefreshAccessTokenError" };
          }
        }
      }

      return token;
    },

    async signIn({ user, profile }) {
      // Get the user's name and email either from the 'user' object or the 'profile' object
      const name = user.name ?? profile?.name;
      const email = user.email ?? profile?.email;

      // Connect to MongoDB
      // const client = await db.user.findFirst();
      // const collection = client.db().collection("users");

      if (!email) {
        // OAuth provider didn't return an email
        return false;
      }

      let existingUser;
      try {
        existingUser = await getUser(email);
      } catch (err) {
        console.error(err);
      }

      if (existingUser) {
        // User exists in your DB
        user.id = existingUser.id.toString(); // or whatever the field for the user id is
        user.breweries = existingUser.breweries; // add breweries to user
        return true;
      } else if (name && email) {
        try {
          // User does not exist, create the user

          // Create a new user with Mongoose
          const newUser = new User({
            fullName: name,
            email: email,
            breweries: [],
          });

          const savedUser = await newUser.save();
          if (savedUser) {
            user.id = savedUser.id.toString(); // Add the new user's id to the user object so it will be included in the JWT
            user.breweries = savedUser.breweries; // breweries for new user
            return true;
          }
        } catch (err) {
          console.error("Error in insertOne:", err);
        }

        return false;
      }
    },
    async session({ session, token, user }) {
      if (token.accessToken) {
        session.user = token as any;
        session.user.accessToken = token.accessToken as string; // sets users accessToken for API authorization

        session.user.breweries = token.breweries as string[]; // sets user's breweries
      }

      return session;
    },
  },
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);

export { authHandler as GET, authHandler as POST };
export default NextAuth(authOptions);
