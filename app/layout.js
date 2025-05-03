import './globals.css';
import RouteLogger from './components/RouteLogger';

export const metadata = {
  title: 'AI CRO',
  description: 'AI-powered conversion rate optimization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Permissions-Policy" content="interest-cohort=()" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <RouteLogger />
        {children}
      </body>
    </html>
  );
} 