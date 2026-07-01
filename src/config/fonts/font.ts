import { Inter } from "next/font/google";

// primary sans font, exposed as the --font-sans css variable
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
