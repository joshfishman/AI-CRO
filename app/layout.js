import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'AI CRO',
  description: 'AI-powered conversion rate optimization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
} 