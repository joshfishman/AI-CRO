import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [workspaceId, setWorkspaceId] = useState('YOUR_WORKSPACE_ID');
  const [copied, setCopied] = useState(false);
  
  const scriptCode = `<!-- Cursor AI-CRO Personalization -->
<script src="https://ai-cro-eight.vercel.app/personalization-loader.js" 
        data-cursor-workspace="${workspaceId}"></script>

<!-- Optional: Fade-in CSS for personalized elements -->
<style>
.personalize-target{visibility:hidden;opacity:0;transition:opacity .3s}
.personalized-loaded .personalize-target{visibility:visible;opacity:1}
</style>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Cursor AI-CRO | AI Website Personalization</title>
        <meta name="description" content="Personalize your website content with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Cursor AI-CRO
        </h1>

        <p className={styles.description}>
          AI-powered website personalization
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>How It Works</h2>
            <ol className={styles.steps}>
              <li>
                <strong>Configure Personalization</strong>
                <p>Use the bookmarklet to select elements and create AI prompts</p>
              </li>
              <li>
                <strong>Add the Loader Script</strong>
                <p>Embed the personalization script in your website</p>
              </li>
              <li>
                <strong>Personalize for Visitors</strong>
                <p>AI-generated content tailored to each visitor type</p>
              </li>
              <li>
                <strong>Optimize with A/B Testing</strong>
                <p>Track performance and automatically apply winning variants</p>
              </li>
            </ol>
          </div>

          <div className={styles.card}>
            <h2>Get Started</h2>
            
            <div className={styles.tools}>
              <Link href="/bookmarklet" className={styles.toolLink}>
                <div className={styles.tool}>
                  <h3>Element Selector &rarr;</h3>
                  <p>Set up the bookmarklet to select and configure elements</p>
                </div>
              </Link>
            </div>
            
            <div className={styles.installSection}>
              <h3>Install the Loader Script</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Your Workspace ID:</label>
                <input
                  type="text"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className={styles.input}
                />
              </div>
              
              <pre className={styles.codeBlock}>
                <code>{scriptCode}</code>
                <button 
                  onClick={handleCopy}
                  className={styles.copyButton}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </pre>
              
              <p className={styles.instruction}>
                Paste this script just before the closing <code>&lt;/body&gt;</code> tag of your website.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Cursor AI-CRO - AI-Powered Personalization
        </p>
      </footer>
    </div>
  );
} 