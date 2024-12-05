//app/api/login/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  // Log the beginning of the login process
  //console.log('Login process started');

  const { email, password } = await req.json();

  // Log the received credentials
  //console.log("Received credentials:", { email, password });

  const client = await clientPromise;
  const db = client.db(); // Use default database from MONGODB_URI

  // Find user by email
  const user = await db.collection("users").findOne({ email });
  //console.log("User Email: ",email);

  // Log if the user is found or not
  if (!user) {
    //console.log('User not found:', email);
    // Return unauthorized if user is not found
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  //console.log('User found:', user);

  // Compare the entered password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // Log the result of password comparison
  //console.log('Is password valid:', isPasswordValid);

  if (!isPasswordValid) {
    //console.log('Password is invalid for user:', email);
    // Return unauthorized if password is invalid
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  //console.log('Password is valid for user:', email);

  // Create JWT token if password is valid
  const token = jwt.sign(
    { userId: user._id, email: user.email, fullName: user.fullName },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  // Log the created token
  //console.log("JWT token created:", token);

  // Create the response and set the JWT token as a cookie
  const response = NextResponse.json({ message: "Login successful" });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 3600,
  });

  // Log that the login was successful
  console.log("Login successful, token set in cookies for user:", email);
  console.log(
    "Login successful, token set in cookies for user:",
    user.fullName
  );

  return response;
}
