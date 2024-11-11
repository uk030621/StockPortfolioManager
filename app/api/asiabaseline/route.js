import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const MONGODB_DB_NAME = "stock_by_user";
const COLLECTION_BASELINE_NAME = "LWJ_asia_settings";

// Helper function to connect to the database
async function connectToDatabase() {
  const client = await clientPromise;
  return client.db(MONGODB_DB_NAME);
}

// Helper function to verify token and extract email
async function getEmailFromToken(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Not authenticated");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.email;
}

// GET - Retrieve baseline portfolio value for the user
export async function GET(req) {
  try {
    const email = await getEmailFromToken(req);
    const db = await connectToDatabase();

    const settings = await db
      .collection(COLLECTION_BASELINE_NAME)
      .findOne({ email });

    return NextResponse.json({
      baselinePortfolioValue: settings?.baselinePortfolioValue || 0,
    });
  } catch (error) {
    console.error("Error fetching baseline portfolio value:", error);
    return NextResponse.json(
      { error: "Failed to retrieve baseline portfolio value" },
      { status: 500 }
    );
  }
}

// POST - Update baseline portfolio value for the user
export async function POST(req) {
  try {
    const email = await getEmailFromToken(req);
    const db = await connectToDatabase();
    const { baselinePortfolioValue } = await req.json();

    const result = await db.collection(COLLECTION_BASELINE_NAME).updateOne(
      { email }, // Filter by user's email
      { $set: { baselinePortfolioValue } },
      { upsert: true } // Create document if it doesn't exist
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update baseline portfolio value" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Baseline portfolio value updated successfully",
    });
  } catch (error) {
    console.error("Error updating baseline portfolio value:", error);
    return NextResponse.json(
      { error: "Failed to update baseline portfolio value" },
      { status: 500 }
    );
  }
}
