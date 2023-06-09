/* eslint-disable no-unused-vars */

import NextAuth from "next-auth/next";
import Users from "./users";
import Brewery from "./brewery";

declare module "next-auth" {
  interface User {
    _id: number;
    fullName: string;
    email: string;
    breweries: string[];
    __v: number;
    accessToken: string;
    refreshToken: string;
  }
  interface Session {
    user: User;
    brewery: Brewery;
  }
}
