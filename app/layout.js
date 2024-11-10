import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./footer/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Stock Manager App",
  description: "Developed by LWJ",
  icons: {
    icon: "/icons/icon-512x512.png",
    apple: "/icons/icon-180x180.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <div className="content">{children}</div>
        <Footer /> {/* Render Footer component here */}
      </body>
    </html>
  );
}
