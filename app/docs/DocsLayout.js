'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/docs', label: 'Documentation' },
  { href: '/docs/installation', label: 'Installation' },
  { href: '/docs/quickstart', label: 'Quickstart' },
  { 
    href: '/docs/integration', 
    label: 'Integration Guides',
    children: [
      { href: '/docs/integration/webflow', label: 'Webflow Integration' },
      { href: '/docs/integration/hellohelpr', label: 'HelloHelpr Guide' },
      { href: '/docs/integration/gtm', label: 'GTM Integration' },
    ]
  },
  { href: '/docs/api', label: 'API Reference' },
  { href: '/docs/troubleshooting', label: 'Troubleshooting' },
];

export default function DocsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="sticky top-8">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isParentOfActive = item.children && 
                  (pathname === item.href || item.children.some(child => pathname === child.href));
                
                return (
                  <li key={item.href} className="mb-2">
                    {item.children ? (
                      <>
                        <Link 
                          href={item.href}
                          className={`font-medium text-sm mb-1 block ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                        >
                          {item.label}
                        </Link>
                        <ul className="pl-3 space-y-1 border-l border-gray-200 mt-1">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link 
                                  href={child.href}
                                  className={`block py-1 text-sm ${isChildActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : (
                      <Link 
                        href={item.href}
                        className={`block py-2 text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          <Link href="/docs" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Documentation
          </Link>
          <div className="prose max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 