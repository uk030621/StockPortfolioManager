import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb"; // Correct MongoDB connection

export async function POST(req) {
  try {
    const { email, password, fullName } = await req.json(); // Get email, password, and fullName from request

    const client = await clientPromise;
    const db = client.db(); // Use default database from MONGODB_URI (or specify if needed)

    // Check if the user already exists
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      // Return conflict if the user already exists
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the 'users' collection with fullName
    await db.collection("users").insertOne({
      fullName,
      email,
      password: hashedPassword,
    });

    // Respond with a success message
    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
