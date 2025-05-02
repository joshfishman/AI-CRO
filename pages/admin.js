import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Admin.module.css';

export default function AdminDashboard() {
  const [workspaces, setWorkspaces] = useState(['default']);
  const [selectedWorkspace, setSelectedWorkspace] = useState('default');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // Authentication handling
  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedKey = localStorage.getItem('cursor_editor_key');
    if (storedKey) {
      setApiKey(storedKey);
      setAuthenticated(true);
    }
  }, []);

  // Fetch workspaces and tests when authenticated and workspace changes
  useEffect(() => {
    if (authenticated) {
      fetchWorkspaces();
      fetchTests(selectedWorkspace);
    }
  }, [authenticated, selectedWorkspace]);

  // Fetch available workspaces
  const fetchWorkspaces = async () => {
    try {
      const response = await fetch(`/api/get-workspaces`, {
        headers: {
          'x-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching workspaces: ${response.status}`);
      }

      const data = await response.json();
      if (data.workspaces && Array.isArray(data.workspaces)) {
        // Always include default if it's not already there
        if (!data.workspaces.includes('default')) {
          data.workspaces.unshift('default');
        }
        setWorkspaces(data.workspaces);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
      // Still keep default workspace
      setWorkspaces(['default']);
    }
  };

  // Fetch tests for a workspace
  const fetchTests = async (workspace) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/get-all-tests?workspace=${workspace}`, {
        headers: {
          'x-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching tests: ${response.status}`);
      }

      const data = await response.json();
      setTests(data.tests || []);
    } catch (err) {
      console.error('Failed to fetch tests:', err);
      setError('Failed to load tests. Please try again.');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    if (apiKey) {
      localStorage.setItem('cursor_editor_key', apiKey);
      setAuthenticated(true);
    }
  };

  // Apply winning variant
  const applyWinner = async (testId, selectorPath) => {
    if (!window.confirm('Are you sure you want to apply the winning variant? This will make it the default for all users.')) {
      return;
    }

    try {
      const response = await fetch('/api/apply-winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          testId,
          selector: selectorPath,
          workspaceId: selectedWorkspace
        })
      });

      if (!response.ok) {
        throw new Error(`Error applying winner: ${response.status}`);
      }

      const result = await response.json();
      alert(`Winner applied successfully!`);
      
      // Refresh tests data
      fetchTests(selectedWorkspace);
    } catch (err) {
      console.error('Failed to apply winner:', err);
      alert(`Failed to apply winner: ${err.message}`);
    }
  };

  // Render login form
  if (!authenticated) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Admin Dashboard | Cursor AI-CRO</title>
          <meta name="description" content="Admin dashboard for Cursor AI-CRO" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          
          <div className={styles.loginCard}>
            <h2>Authentication Required</h2>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="apiKey">Editor API Key:</label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" className={styles.button}>Login</button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Main admin dashboard
  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Dashboard | Cursor AI-CRO</title>
        <meta name="description" content="Admin dashboard for Cursor AI-CRO" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('cursor_editor_key');
              setAuthenticated(false);
            }}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>

        <div className={styles.workspaceSelector}>
          <label htmlFor="workspace">Workspace:</label>
          <select 
            id="workspace" 
            value={selectedWorkspace} 
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            className={styles.select}
          >
            {workspaces.map(ws => (
              <option key={ws} value={ws}>{ws}</option>
            ))}
          </select>
        </div>

        <div className={styles.dashboard}>
          <h2>Tests in Workspace: {selectedWorkspace}</h2>
          
          {loading ? (
            <div className={styles.loading}>Loading tests...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : tests.length === 0 ? (
            <div className={styles.empty}>
              <p>No tests found in this workspace.</p>
              <p>Create tests using the <a href="/bookmarklet" className={styles.link}>element selector bookmarklet</a>.</p>
            </div>
          ) : (
            <div className={styles.testsList}>
              {tests.map(test => (
                <div key={test.id} className={styles.testCard}>
                  <div className={styles.testHeader}>
                    <h3>{test.url}</h3>
                    <div className={styles.testMeta}>
                      <span>Last updated: {new Date(test.lastUpdated).toLocaleString()}</span>
                      <span>{test.selectors?.length || 0} elements</span>
                    </div>
                  </div>
                  
                  <div className={styles.testStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{test.stats?.impressions || 0}</span>
                      <span className={styles.statLabel}>Impressions</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{test.stats?.ctaClicks || 0}</span>
                      <span className={styles.statLabel}>Clicks</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>
                        {test.stats?.impressions > 0 
                          ? ((test.stats.ctaClicks / test.stats.impressions) * 100).toFixed(1) + '%' 
                          : '0%'}
                      </span>
                      <span className={styles.statLabel}>CTR</span>
                    </div>
                  </div>
                  
                  <div className={styles.testElements}>
                    <h4>Elements being tested:</h4>
                    {test.selectors && test.selectors.map((selector, idx) => {
                      const selectorStats = test.selectorResults?.[selector.selector] || {};
                      const hasWinner = selectorStats.winner !== null && selectorStats.confidence >= 95;
                      
                      return (
                        <div key={idx} className={styles.element}>
                          <div className={styles.elementHeader}>
                            <div className={styles.elementSelector}>{selector.selector}</div>
                            <div className={styles.elementType}>{selector.contentType || 'text'}</div>
                          </div>
                          
                          <div className={styles.variants}>
                            <table className={styles.variantsTable}>
                              <thead>
                                <tr>
                                  <th>Variant</th>
                                  <th>User Type</th>
                                  <th>Impr.</th>
                                  <th>Clicks</th>
                                  <th>CTR</th>
                                  <th>vs Default</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selector.variants.map((variant, vidx) => {
                                  const variantStats = selectorStats.variants && 
                                    selectorStats.variants.find(v => v.variantId === vidx.toString());
                                  const isWinner = selectorStats.winner === vidx.toString();
                                  
                                  return (
                                    <tr 
                                      key={vidx} 
                                      className={`${styles.variant} ${variant.isDefault ? styles.defaultVariant : ''} ${isWinner ? styles.winnerVariant : ''}`}
                                    >
                                      <td>
                                        {variant.name || `Variant ${vidx + 1}`}
                                        {variant.isDefault && ' (Default)'}
                                        {isWinner && ' 🏆'}
                                      </td>
                                      <td>{variant.userType || 'all'}</td>
                                      <td>{variantStats?.impressions || 0}</td>
                                      <td>{variantStats?.ctaClicks || 0}</td>
                                      <td>
                                        {variantStats?.impressions > 0 
                                          ? variantStats.ctr + '%' 
                                          : '0%'}
                                      </td>
                                      <td className={variantStats?.improvement > 0 ? styles.positive : 
                                                     variantStats?.improvement < 0 ? styles.negative : ''}>
                                        {variant.isDefault ? '-' : 
                                          variantStats?.improvement > 0 ? '+' + variantStats.improvement + '%' :
                                          variantStats?.improvement < 0 ? variantStats.improvement + '%' : '0%'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          
                          {hasWinner && (
                            <div className={styles.winnerActions}>
                              <div className={styles.confidenceBar}>
                                <div 
                                  className={styles.confidenceFill} 
                                  style={{ width: `${Math.min(100, selectorStats.confidence)}%` }}
                                >
                                  {selectorStats.confidence}% confidence
                                </div>
                              </div>
                              <button 
                                onClick={() => applyWinner(test.id, selector.selector)}
                                className={styles.applyButton}
                              >
                                Apply Winner as Default
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className={styles.testActions}>
                    <a 
                      href={`${test.url}?workspace=${selectedWorkspace}&show_cursor_results=true`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.viewButton}
                    >
                      View Page with Results
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 