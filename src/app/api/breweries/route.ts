import { NextResponse, NextRequest } from "next/server";
import {db} from "@/lib/db";
import { Brewery } from "@/app/types/brewery";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";
import { Users } from "@/app/types/users";

const reqSchema = z.object({
  userId: z.number(),
  breweryId: z.number(),
 
});

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
      
      client = await db.brewery.findMany();
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

export async function DELETE(req: Request) {
  const body = req.body as unknown

  const auth = req.headers.authorization;

  if(!auth) return NextResponse.json({error: "Unauthorized"}, {status: 401})


  

  try {
    
    const {userId, breweryId} = reqSchema.safeParse(body)

    const vlidApiKey = await
  } catch (error) {
    if(error instanceof z.ZodError) {
      return NextResponse.json({error: error.issues}, {status: 400})
    }
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
  }


 }
