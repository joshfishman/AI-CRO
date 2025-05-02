import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Bookmarklet.module.css';

export default function Bookmarklet() {
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  const [hostInput, setHostInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [editorKey, setEditorKey] = useState('');
  
  // Generate the bookmarklet code
  useEffect(() => {
    // Default to the current host if available
    if (typeof window !== 'undefined') {
      setHostInput(window.location.origin);
    }
  }, []);
  
  // Update bookmarklet code when host changes
  useEffect(() => {
    if (!hostInput) return;
    
    const fetchBookmarklet = async () => {
      try {
        const response = await fetch(`/api?path=get-bookmarklet&baseUrl=${encodeURIComponent(hostInput)}&editorKey=${encodeURIComponent(editorKey || '')}`);
        if (response.ok) {
          const code = await response.text();
          setBookmarkletCode(code);
        }
      } catch (error) {
        console.error('Error fetching bookmarklet:', error);
      }
    };
    
    fetchBookmarklet();
  }, [hostInput, editorKey]);
  
  // Handle copy button click
  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Cursor AI-CRO Bookmarklet</title>
        <meta name="description" content="Cursor AI-CRO element selector bookmarklet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Cursor AI-CRO Bookmarklet
        </h1>

        <p className={styles.description}>
          Use this bookmarklet to select elements for AI personalization
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Setup Instructions</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>API Base URL:</label>
              <input
                type="text"
                value={hostInput}
                onChange={(e) => setHostInput(e.target.value)}
                placeholder="https://your-deployment-url.vercel.app"
                className={styles.input}
              />
              <p className={styles.hint}>Usually your deployment URL</p>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Editor API Key:</label>
              <input
                type="text"
                value={editorKey}
                onChange={(e) => setEditorKey(e.target.value)}
                placeholder="Your editor API key"
                className={styles.input}
              />
              <p className={styles.hint}>From CURSOR_EDITOR_KEY environment variable</p>
            </div>
            
            <div className={styles.bookmarklet}>
              <p><strong>1. Drag this link to your bookmarks bar:</strong></p>
              <a 
                href={bookmarkletCode} 
                className={styles.bookmarkletLink}
                onClick={(e) => e.preventDefault()}
              >
                Cursor AI-CRO Selector
              </a>
            </div>
            
            <div className={styles.codeBlock}>
              <p><strong>2. Or copy this code:</strong></p>
              <textarea
                readOnly
                value={bookmarkletCode}
                className={styles.codeArea}
              />
              <button 
                onClick={handleCopy}
                className={styles.copyButton}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <h2>How to Use</h2>
            <ol className={styles.instructions}>
              <li>Set up the bookmarklet with your API base URL and editor key</li>
              <li>Navigate to the page you want to personalize</li>
              <li>Click the bookmarklet in your bookmarks bar</li>
              <li>Click on elements you want to personalize</li>
              <li>For each element, enter a prompt for AI to generate content</li>
              <li>Click "Save Config" when done</li>
              <li>Add the personalization loader script to your site</li>
            </ol>
            
            <h3 className={styles.subsection}>Example Prompts</h3>
            <ul className={styles.examples}>
              <li><strong>Heading:</strong> "Write a catchy headline for a landing page selling eco-friendly water bottles"</li>
              <li><strong>Call to Action:</strong> "Write a compelling CTA button text for signing up for a newsletter"</li>
              <li><strong>Product Description:</strong> "Rewrite this product description to highlight benefits instead of features"</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Cursor AI-CRO Personalization Tool
        </p>
      </footer>
    </div>
  );
} 