//app/logout-confirmation
"use client"; // Necessary for client-side hooks like useRouter

import { useRouter } from "next/navigation"; // Correct import for Next.js 13+ client-side navigation
import { useState } from "react"; // Import useState hook from React

const LogoutConfirmation = () => {
  const router = useRouter(); // Initialize router before using it
  const [showInstructions, setShowInstructions] = useState(false);

  const handleGoToLogin = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push("/login");
      } else {
        console.error("Failed to logout:", response.statusText);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleShowInstructions = () => setShowInstructions(true);

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        maxWidth: "100%",
        margin: "auto",
        marginTop: "50px",
      }}
    >
      <div className="logout-container">
        <h1 style={{ marginBottom: "15px" }}>
          You have successfully logged out!
        </h1>
        <p>What would you like to do next?</p>
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleGoToLogin} className="fade-in-button">
            Go to Login Page
          </button>
          <button onClick={handleShowInstructions} className="fade-in-button">
            Close Web Page
          </button>
        </div>
        {showInstructions && (
          <div className="fade-in-instructions">
            <p>
              To close this tab, please click the &quot;X&quot; button on the
              tab or use your browser&apos;s usual method to close the tab.
            </p>
          </div>
        )}
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        .logout-container {
          color: white;
          background-color: black;
          padding: 20px;
          border-radius: 5px;
          border: 1px solid black;
          max-width: 400px;
          margin: auto;
          opacity: 0;
          animation: fadeIn 1s forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        .fade-in-button {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          background-color: green;
          color: white;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .fade-in-button:hover {
          transform: scale(1.05);
        }

        .fade-in-instructions {
          margin-top: 20px;
          opacity: 0;
          animation: fadeInInstructions 1s forwards;
        }

        @keyframes fadeInInstructions {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LogoutConfirmation;
