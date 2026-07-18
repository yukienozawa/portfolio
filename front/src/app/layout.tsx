import "./globals.css";
import { Space_Grotesk, Zen_Kaku_Gothic_New } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
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
    <html lang="en" className={`${spaceGrotesk.variable} ${zenKakuGothicNew.variable}`}>
      <body className="bg-slate-50">
        {children}
      </body>
    </html>
  );
}