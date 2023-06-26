import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { authOptions } from "../auth/[...nextauth]/route";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Create and connect the MongoDB client outside of the handler function
let client;

export async function GET() {
  const user = await getServerSession(authOptions).then((res) => res?.user);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", success: false },
      { status: 401 }
    );
  }
  try {
    // Reuse the existing MongoDB client if it's already connected
    if (!client) {
      client = await db.breweries.findMany();
    }

    const collection = client.db().collection("breweries");

    // Perform your database query
    const breweries = await collection.find({}).toArray();

    // Return the results of the query
    return NextResponse.json(breweries);
  } catch (error) {
    console.error("Failed to fetch breweries: ", error);

    // Return an HTTP 500 error if something went wrong
    return new NextResponse("Failed to fetch breweries");
  }
}

const reqSchema = z.object({
  breweryId: z.string(),
});

//  DELETE REQUEST ******************************
export async function POST(req) {
  // Convert the ReadableStream to a string
  const body = await new Response(req.body).json();

  // Parse the string as a JavaScript object
  // Convert the ReadableStream to a string
  console.log(body.breweryId);
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Parse the string as a JavaScript object
    const { data, success } = reqSchema.safeParse(body);
    console.log({ data, success });

    if (!success) {
      return NextResponse.json(
        { error: "Brewery does not exist" },
        { status: 500 }
      );
    }
    const brewery = await db.breweries.delete({
      where: { id: data.breweryId },
    });
    console.log(brewery);
    return NextResponse.json({
      message: `${brewery.companyName} has been deleted`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
