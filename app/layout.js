import './globals.css';

export const metadata = {
  title: 'AI CRO',
  description: 'AI-powered conversion rate optimization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 