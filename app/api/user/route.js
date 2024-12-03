// app/api/user/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    // Extract the JWT token from the request cookies
    const token = req.cookies.get("token")?.value;

    // If no token, return unauthorized
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalize the email to lowercase
    const normalizedEmail = decoded.email.trim().toLowerCase();

    // Log the normalized email to the console
    console.log("Normalized User Email:", normalizedEmail);

    // Return user data (email in this case) from the token payload
    return NextResponse.json({ email: normalizedEmail });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
