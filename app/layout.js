import { Manrope } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/components/auth-provider";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Chopin Delivery Platform",
  description: "Modern delivery platform for customers, riders, and admins.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased bg-background text-foreground`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
