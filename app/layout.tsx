import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Deutsch Trainer", description: "Adaptive German A1 practice prototype" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
