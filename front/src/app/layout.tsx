import "./globals.css";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata = {
  title: "Yukie Nozawa | Official Portfolio",
  description: "The official portfolio of Yukie Nozawa, a full-stack developer dedicated to crafting essential daily value through modern web technologies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="bg-slate-50">
        {children}
      </body>
    </html>
  );
}