"use client"; // Ensure it's client-side rendered

import styles from './generror.module.css'; // Import your CSS module
import { useRouter } from 'next/navigation';

const ErrorPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // Navigate back to the previous page
  };

  return (
    <div className={styles.errorPage}>
      <h1 className={styles.errorTitle}>Oops! Something went wrong.</h1>
      <p className={styles.errorMessage}>
        We&apos;re sorry, but the page you&apos;re looking for could not be found or an error occurred.
      </p>
      <p className={styles.suggestion}>
        You can try refreshing the page, or go back to the previous page.
      </p>
      <button className={styles.goBackButton} onClick={handleGoBack}>
        Go Back
      </button>
    </div>
  );
};

export default ErrorPage;
