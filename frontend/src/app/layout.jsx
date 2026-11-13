import "./globals.css";

export const metadata = {
  title: "LogiTrack",
  description: "Gestão e rastreamento de entregas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
