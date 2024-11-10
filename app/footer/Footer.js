"use client"; // Make this a Client Component

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const showFooter = !(pathname === "/login" || pathname === "/signup");

  return showFooter ? (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()} LWJ StockPortfolioManager. All rights
        reserved.
      </p>
    </footer>
  ) : null;
}
