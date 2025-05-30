/* eslint-disable no-unused-vars */

import NextAuth from "next-auth/next";
import Users from "./users";
import Brewery from "./brewery";

export declare module "next-auth" {
  interface User {
    id: number;
    fullName: string;
    email: string;
    breweries: string[];
    __v: number;
    image: string;
    picture?: string;
    accessToken: string;
    refreshToken: string;
    notifications: Notifications;
    selectedBreweryId: string | null;
  }
  interface Session {
    user: User;
    brewery: Brewery;
  }
}
