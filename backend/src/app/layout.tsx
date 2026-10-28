import React from "react";

export const metadata = {
  title: "Homemart4u Backend API",
  description: "Dedicated Backend & API Service for Homemart4u",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fafafa" }}>{children}</body>
    </html>
  );
}
