"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const [fullName, setFullName] = useState(""); // New state for full name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter(); // Initialize useRouter

  // Helper function to capitalize the first letter of each word
  const capitalizeWords = (input) => {
    return input.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // useEffect to capitalize the name when it changes
  useEffect(() => {
    if (fullName) {
      setFullName(capitalizeWords(fullName));
    }
  }, [fullName]);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }), // Include fullName in the request
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setFullName("");
        setEmail("");
        setPassword("");
        setError("");

        // Redirect to the login page upon successful signup
        router.push("/login");
      } else {
        setError(data.error);
        setMessage("");
      }
    } catch (error) {
      setError("An error occurred during signup");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "black",
        textAlign: "center",
        padding: "0px",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "black",
          border: "1px solid black",
          borderRadius: "8px",
          padding: "20px",
          margin: "auto",
          maxWidth: "400px",
          boxSizing: "border-box",
        }}
      >
        <Image
          className="login-pic"
          src="/bull_bear.jpg"
          alt="Portfolio Image"
          width={150}
          height={150}
          priority={true}
          style={{ marginLeft: "5px", borderRadius: "50px", marginTop: "20px" }}
        />
        <h1
          style={{
            textAlign: "center",
            marginBottom: "15px",
            color: "#c8f3c8",
          }}
        >
          Stock Portfolio
        </h1>
        <h1
          style={{ textAlign: "center", marginBottom: "15px", color: "white" }}
        >
          Register
        </h1>

        <form onSubmit={handleSignup} style={{ width: "100%" }}>
          {/* Full Name Input */}
          <div style={{ width: "100%", marginBottom: "10px" }}>
            <input
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#c8f3c8",
                border: "none",
                borderRadius: "5px",
                fontSize: "17px",
                color: "black",
                boxSizing: "border-box",
              }}
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div style={{ width: "100%", marginBottom: "10px" }}>
            <input
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#c8f3c8",
                border: "none",
                borderRadius: "5px",
                fontSize: "17px",
                color: "black",
                boxSizing: "border-box",
              }}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div style={{ width: "100%", marginBottom: "10px" }}>
            <input
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#c8f3c8",
                border: "none",
                borderRadius: "5px",
                color: "black",
                fontSize: "17px",
                boxSizing: "border-box",
              }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="reg-button"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "7px",
              border: "none",
              cursor: "pointer",
              boxSizing: "border-box",
              marginBottom: "10px",
            }}
            type="submit"
          >
            Sign Up
          </button>

          <div style={{ textAlign: "center" }}>
            <Link className="login-link" href="/login">
              Login
            </Link>
          </div>
        </form>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        {message && (
          <p style={{ color: "white", marginTop: "30px" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
