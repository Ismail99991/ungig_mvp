export const metadata = { title: "Unteks gig MVP" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ fontFamily: "sans-serif", margin: 0, padding: 16 }}>
        {children}
      </body>
    </html>
  );
}
