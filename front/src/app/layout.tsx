import "./globals.css";

export const metadata = {
  // 💡 タイトル：名前とポートフォリオをシンプルかつ洗練された形で表現
  title: "Yukie Nozawa | Official Portfolio",
  // 💡 説明文：モダンなWeb技術で「本質的な日常の価値」を形にするエンジニアであることをアピール
  description: "The official portfolio of Yukie Nozawa, a full-stack developer dedicated to crafting essential daily value through modern web technologies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}