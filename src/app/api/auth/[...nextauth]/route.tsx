import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { signJwtAccessToken, signJwtRefreshToken } from "@/lib/jwt";
import type { NextAuthOptions } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
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
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        const accessToken = signJwtAccessToken(user); // creates accessToken for API authorization
        const refreshToken = signJwtRefreshToken(user); // sends for new accessToken after expires
        token.id = user.id;
        return {
          ...token,
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
          console.log("jwt.verify error:", e);
          console.log("token", token);
          try {
            const { exp, ...rest } = jwt.verify(
              token.refreshToken as string,
              process.env.REFRESH_TOKEN_SECRET as string
            ) as JwtPayload & { exp?: number };
            // console.log("experation", exp, "Rest of Verify", rest);
            const newAccessToken = signJwtAccessToken(rest);
            console.log("newAcessToken", newAccessToken);
            token.accessToken = newAccessToken;
            console.log("New AccessToken On User", token);
          } catch (err) {
            console.error("Error refreshing access token", err);

            return { ...token, error: "RefreshAccessTokenError" };
          }
        }
      }

      return token;
    },

    async signIn({ user, profile }) {
      // Connect to MongoDB
      const client = await mongo;
      const collection = client.db().collection("users");

      // Get the user's name and email either from the 'user' object or the 'profile' object
      const name = user.name ?? profile?.name;
      const email = user.email ?? profile?.email;

      if (!email) {
        // OAuth provider didn't return an email
        return false;
      }

      let existingUser;
      try {
        existingUser = await collection.findOne({ email: email });
      } catch (err) {
        console.error(err);
      }

      if (existingUser) {
        // User exists in your DB
        user.id = existingUser._id.toString(); // or whatever the field for the user id is
        return true;
      } else {
        try {
          // User does not exist, create the user
          const newUser = await collection.insertOne({
            fullName: name,
            username: email, // using email as username here, modify if needed
            email: email,
            breweries: [],
          });

          if (newUser) {
            user.id = newUser.insertedId.toString(); // Add the new user's id to the user object so it will be included in the JWT
            return true;
          }
        } catch (err) {
          console.error("Error in insertOne:", err);
        }

        return false;
      }
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.user = token as any;
        session.user.accessToken = token.accessToken as string; // sets users accessToken for API authorization
      }

      return session;
    },
  },
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);

export { authHandler as GET, authHandler as POST };
export default NextAuth(authOptions);
