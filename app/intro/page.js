"use client"; // This tells Next.js that this component should be rendered on the client side

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // Import your CSS module

const Introduction = () => {
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [hideIntroductionChecked, setHideIntroductionChecked] = useState(false);
  const router = useRouter();

  // Check localStorage to determine if the user has opted out
  useEffect(() => {
    const hideIntro = localStorage.getItem('hideIntroduction');
    if (hideIntro === 'true') {
      router.push('/ukstock'); // Redirect immediately if the introduction is set to be hidden
    } else {
      setShowIntroduction(true); // Show the introduction if not opted out
    }
  }, [router]);

  const handleCheckboxChange = (e) => {
    setHideIntroductionChecked(e.target.checked);
  };

  const handleContinue = () => {
    if (hideIntroductionChecked) {
      localStorage.setItem('hideIntroduction', 'true');
    }
    setShowIntroduction(false);
    router.push('/ukstock'); // Redirect to homepage or another default page
  };

  if (!showIntroduction) {
    return null;
  }

  return (
    <div className={styles.introduction}>
      <h1 className={styles.heading}>Welcome to the Portfolio Manager App</h1>
      <p className={styles.description}>
        This app allows you to manage and monitor your stock portfolio easily.
        You can add, edit, and delete stocks from your portfolio, track their
        performance, and see real-time changes in value. Here&apos;s what the app
        offers:
      </p>
      <ul className={styles.list}>
        <li className={styles.listItem}>Manage stocks from major indices like FTSE, Dow Jones, Nikkei, and DAX.</li>
        <li className={styles.listItem}>Track stock symbols, prices, shares held, and total values per stock.</li>
        <li className={styles.listItem}>Set a baseline value for your portfolio and monitor the indicative total portfolio value.</li>
        <li className={styles.listItem}>View key statistics like value change from baseline and percentage change.</li>
        <li className={styles.listItem}>Access support tools like Symbol Lookup and Currency Converter for a seamless experience.</li>
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
