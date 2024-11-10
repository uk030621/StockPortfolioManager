//app/page.js
"use client"; // Necessary for client-side rendering

import { useRouter } from "next/navigation"; // Correct import
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // Check if the user is authenticated (replace with your actual logic)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/checkAuth"); // Adjust this route to your actual API
        if (res.ok) {
          setIsAuthenticated(true);
          router.push("/intro"); // Redirect to /stock after successful authentication
        } else {
          setIsAuthenticated(false);
          router.push("/login"); // Redirect to login if not authenticated
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.push("/login"); // Redirect to login on error
      }
    };

    checkAuth(); // Run on component mount
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="loading" style={{ padding: "10px", color: "gray" }}>
        Loading...
      </div>
    ); // Show a loading state while checking auth
  }

  // Return null or a loading spinner since the user will be redirected
  return null; // Since the user is redirected, there's no need to display anything
}
