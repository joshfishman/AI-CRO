import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Admin.module.css';

export default function SegmentsManager() {
  const [workspaces, setWorkspaces] = useState(['default']);
  const [selectedWorkspace, setSelectedWorkspace] = useState('default');
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [currentSegment, setCurrentSegment] = useState({
    id: '',
    name: '',
    rules: []
  });

  // Authentication handling
  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedKey = localStorage.getItem('cursor_editor_key');
    if (storedKey) {
      setApiKey(storedKey);
      setAuthenticated(true);
    }
  }, []);

  // Fetch workspaces and segments when authenticated and workspace changes
  useEffect(() => {
    if (authenticated) {
      fetchWorkspaces();
      fetchSegments(selectedWorkspace);
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

  // Fetch segments for a workspace
  const fetchSegments = async (workspace) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/manage-segments?workspaceId=${workspace}`, {
        headers: {
          'x-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching segments: ${response.status}`);
      }

      const data = await response.json();
      setSegments(data.segments || []);
    } catch (err) {
      console.error('Failed to fetch segments:', err);
      setError('Failed to load segments. Please try again.');
      setSegments([]);
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentSegment.id || !currentSegment.name || currentSegment.rules.length === 0) {
      alert('Please fill out all required fields and add at least one rule.');
      return;
    }
    
    try {
      const response = await fetch(`/api/manage-segments?workspaceId=${selectedWorkspace}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(currentSegment)
      });
      
      if (!response.ok) {
        throw new Error(`Error saving segment: ${response.status}`);
      }
      
      const result = await response.json();
      alert(result.message || 'Segment saved successfully');
      
      // Reset form
      setShowForm(false);
      setCurrentSegment({
        id: '',
        name: '',
        rules: []
      });
      
      // Refresh segments list
      fetchSegments(selectedWorkspace);
    } catch (err) {
      console.error('Failed to save segment:', err);
      alert(`Failed to save segment: ${err.message}`);
    }
  };

  // Add a new rule
  const addRule = () => {
    setCurrentSegment({
      ...currentSegment,
      rules: [
        ...currentSegment.rules,
        { field: '', operator: '', value: '' }
      ]
    });
  };

  // Update a rule
  const updateRule = (index, field, value) => {
    const updatedRules = [...currentSegment.rules];
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: value
    };
    
    setCurrentSegment({
      ...currentSegment,
      rules: updatedRules
    });
  };

  // Remove a rule
  const removeRule = (index) => {
    const updatedRules = currentSegment.rules.filter((_, i) => i !== index);
    setCurrentSegment({
      ...currentSegment,
      rules: updatedRules
    });
  };

  // Delete a segment
  const deleteSegment = async (segmentId) => {
    if (!window.confirm(`Are you sure you want to delete segment "${segmentId}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/manage-segments?workspaceId=${selectedWorkspace}&segmentId=${segmentId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting segment: ${response.status}`);
      }
      
      const result = await response.json();
      alert(result.message || 'Segment deleted successfully');
      
      // Refresh segments list
      fetchSegments(selectedWorkspace);
    } catch (err) {
      console.error('Failed to delete segment:', err);
      alert(`Failed to delete segment: ${err.message}`);
    }
  };

  // Edit a segment
  const editSegment = (segment) => {
    setCurrentSegment(segment);
    setFormMode('edit');
    setShowForm(true);
  };

  // Render login form
  if (!authenticated) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Segments Manager | Cursor AI-CRO</title>
          <meta name="description" content="Segments manager for Cursor AI-CRO" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>Segments Manager</h1>
          
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

  // Main segments manager
  return (
    <div className={styles.container}>
      <Head>
        <title>Segments Manager | Cursor AI-CRO</title>
        <meta name="description" content="Segments manager for Cursor AI-CRO" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Segments Manager</h1>
          <div className={styles.headerActions}>
            <button 
              onClick={() => {
                setFormMode('create');
                setCurrentSegment({ id: '', name: '', rules: [] });
                setShowForm(true);
              }}
              className={styles.createButton}
            >
              Create Segment
            </button>
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
        </div>

        <div className={styles.navigation}>
          <a href="/admin" className={styles.navLink}>Dashboard</a>
          <a href="/segments" className={`${styles.navLink} ${styles.active}`}>Segments</a>
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

        {/* Segments List */}
        <div className={styles.segmentsContainer}>
          <h2>User Segments</h2>
          
          {loading ? (
            <div className={styles.loading}>Loading segments...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : segments.length === 0 ? (
            <div className={styles.empty}>
              <p>No segments defined for this workspace.</p>
              <p>Create a segment to start targeting specific user groups.</p>
            </div>
          ) : (
            <div className={styles.segmentsList}>
              {segments.map(segment => (
                <div key={segment.id} className={styles.segmentCard}>
                  <div className={styles.segmentHeader}>
                    <h3>{segment.name}</h3>
                    <div className={styles.segmentId}>ID: {segment.id}</div>
                  </div>
                  
                  <div className={styles.segmentRules}>
                    <h4>Rules:</h4>
                    <ul>
                      {segment.rules.map((rule, idx) => (
                        <li key={idx} className={styles.rule}>
                          {rule.field} {rule.operator} <strong>{rule.value}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.segmentActions}>
                    <button 
                      onClick={() => editSegment(segment)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteSegment(segment.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Segment Form */}
        {showForm && (
          <div className={styles.formOverlay}>
            <div className={styles.segmentForm}>
              <div className={styles.formHeader}>
                <h2>{formMode === 'create' ? 'Create Segment' : 'Edit Segment'}</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className={styles.closeButton}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="segmentId">Segment ID:</label>
                  <input
                    type="text"
                    id="segmentId"
                    value={currentSegment.id}
                    onChange={(e) => setCurrentSegment({...currentSegment, id: e.target.value})}
                    className={styles.input}
                    placeholder="my-segment-id"
                    required
                    disabled={formMode === 'edit'}
                  />
                  <small>Unique identifier used in targeting rules</small>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="segmentName">Segment Name:</label>
                  <input
                    type="text"
                    id="segmentName"
                    value={currentSegment.name}
                    onChange={(e) => setCurrentSegment({...currentSegment, name: e.target.value})}
                    className={styles.input}
                    placeholder="My Customer Segment"
                    required
                  />
                  <small>Descriptive name shown in the UI</small>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Rules:</label>
                  <div className={styles.rulesList}>
                    {currentSegment.rules.map((rule, idx) => (
                      <div key={idx} className={styles.ruleItem}>
                        <div className={styles.ruleFields}>
                          <select
                            value={rule.field}
                            onChange={(e) => updateRule(idx, 'field', e.target.value)}
                            className={styles.select}
                            required
                          >
                            <option value="">Select Field</option>
                            <optgroup label="Visitor">
                              <option value="email">Email Address</option>
                              <option value="deviceType">Device Type</option>
                              <option value="browser">Browser</option>
                              <option value="referrer">Referrer</option>
                            </optgroup>
                            <optgroup label="Behavior">
                              <option value="pageViews">Page Views</option>
                              <option value="timeOnSite">Time on Site</option>
                              <option value="lastVisit">Last Visit</option>
                            </optgroup>
                            <optgroup label="HubSpot">
                              <option value="hubspot.industry">Industry</option>
                              <option value="hubspot.company_size">Company Size</option>
                              <option value="hubspot.customer_tier">Customer Tier</option>
                              <option value="hubspot.lifecyclestage">Lifecycle Stage</option>
                            </optgroup>
                          </select>
                          
                          <select
                            value={rule.operator}
                            onChange={(e) => updateRule(idx, 'operator', e.target.value)}
                            className={styles.select}
                            required
                          >
                            <option value="">Select Operator</option>
                            <option value="equals">Equals</option>
                            <option value="notEquals">Not Equals</option>
                            <option value="contains">Contains</option>
                            <option value="notContains">Does Not Contain</option>
                            <option value="greaterThan">Greater Than</option>
                            <option value="lessThan">Less Than</option>
                            <option value="before">Before</option>
                            <option value="after">After</option>
                          </select>
                          
                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => updateRule(idx, 'value', e.target.value)}
                            className={styles.input}
                            placeholder="Value"
                            required
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeRule(idx)}
                          className={styles.removeRuleButton}
                          title="Remove Rule"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    {currentSegment.rules.length === 0 && (
                      <div className={styles.noRules}>
                        No rules defined. Add at least one rule.
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={addRule}
                    className={styles.addRuleButton}
                  >
                    + Add Rule
                  </button>
                </div>
                
                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.saveButton}
                  >
                    {formMode === 'create' ? 'Create Segment' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 