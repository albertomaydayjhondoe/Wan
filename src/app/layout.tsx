import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wan",
  description: "Wan application",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <footer className="border-t py-4 text-center text-sm text-gray-500">
          © 2026 Wan. All rights reserved.
        </footer>
      </body>
    </html>
  );
}