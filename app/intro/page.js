"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const Introduction = () => {
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [hideIntroductionChecked, setHideIntroductionChecked] = useState(false);
  const [userName, setUserName] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/userName", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.fullName);
          if (data.hideIntroduction) {
            router.push("/ukstock");
          } else {
            setShowIntroduction(true);
          }
          setHideIntroductionChecked(data.hideIntroduction);
        } else {
          console.error("Failed to fetch user information");
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };

    fetchUserInfo();
  }, []); // Avoid unnecessary re-renders

  const handleCheckboxChange = (e) => {
    setHideIntroductionChecked(e.target.checked);
  };

  const handleContinue = async () => {
    try {
      // Save the hideIntroduction preference in MongoDB
      await fetch("/api/userName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hideIntroduction: hideIntroductionChecked }),
      });

      setShowIntroduction(false);
      router.push("/ukstock"); // Redirect to homepage or another default page
    } catch (error) {
      console.error("Error updating hideIntroduction preference:", error);
    }
  };

  if (!showIntroduction) {
    return null;
  }

  const firstName = userName ? userName.split(" ")[0] : null;

  return (
    <div className={styles.introduction}>
      <h1 className={styles.heading}>
        Hello {firstName}, <br /> welcome to your portfolio manager app
      </h1>
      <p className={styles.description}>
        This app allows you to manage and monitor your stock portfolio easily.
        You can add, edit, and delete stocks from your portfolio, track their
        performance, and see real-time changes in value. Here&apos;s what the
        app offers:
      </p>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          Manage stocks from major indices like FTSE, Dow Jones, Nikkei, and
          DAX.
        </li>
        <li className={styles.listItem}>
          Track stock symbols, prices, shares held, and total values per stock.
        </li>
        <li className={styles.listItem}>
          Set a baseline value for your portfolio and monitor the indicative
          total portfolio value.
        </li>
        <li className={styles.listItem}>
          View key statistics like value change from baseline and percentage
          change.
        </li>
        <li className={styles.listItem}>
          Access support tools like Symbol Lookup and Currency Converter for a
          seamless experience.
        </li>
        <li className={styles.listItem}>
          View current value and comprehensive details about all available
          Cryptocurrencies.
        </li>
      </ul>
      <div className={styles.checkboxContainer}>
        <label>
          <input
            type="checkbox"
            checked={hideIntroductionChecked}
            onChange={handleCheckboxChange}
          />
          Do not show me this again
        </label>
      </div>
      <button className={styles.continueButton} onClick={handleContinue}>
        Continue to Portfolio
      </button>
    </div>
  );
};

export default Introduction;
