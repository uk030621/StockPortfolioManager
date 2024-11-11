import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

// Helper function to verify token and extract user details
async function getUserFromToken(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) throw new Error("No authentication token found");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { email: decoded.email, fullName: decoded.fullName };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Not authenticated");
  }
}

export async function GET(req) {
  try {
    const { email, fullName } = await getUserFromToken(req);
    const client = await clientPromise;
    const db = client.db("stock_by_user");

    // Find the user by email
    const user = await db.collection("users").findOne({ email });

    // Check if user document was found and log the outcome
    if (!user) {
      console.log("User not found, returning default preferences");
    }

    return NextResponse.json({
      email,
      fullName,
      hideIntroduction: user?.hideIntroduction ?? false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve user information" },
      { status: 401 }
    );
  }
}

// POST handler to update the hideIntroduction preference
export async function POST(req) {
  try {
    const { email } = await getUserFromToken(req);
    const { hideIntroduction } = await req.json();

    const client = await clientPromise;
    const db = client.db("stock_by_user");
    await db
      .collection("users")
      .updateOne({ email }, { $set: { hideIntroduction } }, { upsert: true });

    return NextResponse.json({ message: "Preference updated successfully" });
  } catch (error) {
    console.error("Error in POST /api/userName:", error.message);
    return NextResponse.json(
      { error: "Failed to update preference" },
      { status: 500 }
    );
  }
}
