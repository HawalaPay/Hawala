import './globals.css';

export const metadata = {
  title: 'Hawala',
  description: 'A Next.js app for sending and receiving cryptocurrency.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {/* Main Content */}
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
