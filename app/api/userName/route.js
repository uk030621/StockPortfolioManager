import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Helper function to verify token and extract user details
async function getUserFromToken(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Not authenticated");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return { email: decoded.email, fullName: decoded.fullName };
}

// GET handler to return user's email and fullName
export async function GET(req) {
  try {
    const { email, fullName } = await getUserFromToken(req);
    return NextResponse.json({ email, fullName }); // Return only email and fullName
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve user information" },
      { status: 401 } // Unauthorized status if token is invalid or missing
    );
  }
}
