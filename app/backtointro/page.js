"use client"; // This tells Next.js that this component should be rendered on the client side

import styles from "./page.module.css"; // Import your CSS module
import Link from "next/link";

const Introduction = () => {
  return (
    <div className={styles.introduction}>
      <h1 className={styles.heading}>Portfolio Manager App</h1>
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
      <div>
        <Link className="return-link-backtointro" href="/ukstock">
          Return
        </Link>
      </div>
    </div>
  );
};

export default Introduction;
