import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Stock Manager App",
  description: "Developed by LWJ",
  icons: {
    icon: "/icons/icon-512x512.png", // Favicon
    apple: "/icons/icon-180x180.png", // Apple touch icon for iOS home screen
  },
  manifest: "/manifest.json", // Link to your Web App Manifest
};

export const viewport = {
  themeColor: "#000000", // Set theme color for browsers and devices here
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add mobile-web-app-capable tags manually */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* You can still manually add theme-color here if needed */}
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <div className="content">
          {children}
        </div>
        {/*<footer className="footer">
          <p>&copy; {new Date().getFullYear()} LWJ StockManager. All rights reserved.</p>
        </footer>*/}
      </body>
    </html>
  );
}
