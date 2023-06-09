/* eslint-disable no-unused-vars */

import NextAuth from "next-auth/next";

declare module "next-auth" {
  interface Session {
    user: {
      _id: number;
      fullName: string;
      username: string;
      email: string;
      breweries: string[];
      accessToken: string;
    };
    brewery: {
      _id: number;
      companyName: string;
      owner: number;
      admin: number[];
      staff: number[];
      categories: number[];
    };
  }
}
