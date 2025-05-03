'use client';

import './globals.css';
import { useEffect } from 'react';

export const metadata = {
  title: 'AI CRO',
  description: 'AI-powered conversion rate optimization',
};

function logError(error, info) {
  console.error('Layout Error:', error);
  console.error('Error Info:', info);
}

export default function RootLayout({ children }) {
  useEffect(() => {
    console.log('Root layout mounted');
    
    // Log route changes
    const logRoute = () => {
      console.log('Current path:', window.location.pathname);
    };
    
    window.addEventListener('popstate', logRoute);
    logRoute(); // Log initial route
    
    return () => window.removeEventListener('popstate', logRoute);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Permissions-Policy" content="interest-cohort=()" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
} 