/**
 * Advanced Targeting Options for Cursor-AI CRO
 * 
 * This file contains advanced targeting options that can be used
 * to enhance the selector bookmarklet with more sophisticated targeting.
 */

// Enhanced user types with more granular segmentation
const ENHANCED_USER_TYPES = [
  // Basic types
  { id: 'all', name: 'All Users' },
  { id: 'new-visitor', name: 'New Visitors' },
  { id: 'returning', name: 'Returning Visitors' },
  { id: 'customer', name: 'Customers' },
  { id: 'prospect', name: 'Prospects' },
  { id: 'lead', name: 'Leads' },
  { id: 'opportunity', name: 'Opportunities' },
  
  // Device-based segments
  { id: 'device:mobile', name: 'Mobile Users', category: 'Device' },
  { id: 'device:desktop', name: 'Desktop Users', category: 'Device' },
  { id: 'device:tablet', name: 'Tablet Users', category: 'Device' },
  
  // Referrer-based segments
  { id: 'referrer:search', name: 'From Search Engines', category: 'Referrer' },
  { id: 'referrer:social', name: 'From Social Media', category: 'Referrer' },
  { id: 'referrer:email', name: 'From Email', category: 'Referrer' },
  { id: 'referrer:direct', name: 'Direct Traffic', category: 'Referrer' },
  
  // Time-based segments
  { id: 'time:morning', name: 'Morning Visitors', category: 'Time' },
  { id: 'time:afternoon', name: 'Afternoon Visitors', category: 'Time' },
  { id: 'time:evening', name: 'Evening Visitors', category: 'Time' },
  { id: 'time:night', name: 'Night Visitors', category: 'Time' },
  
  // Engagement-based segments
  { id: 'engagement:high', name: 'High Engagement', category: 'Engagement' },
  { id: 'engagement:medium', name: 'Medium Engagement', category: 'Engagement' },
  { id: 'engagement:low', name: 'Low Engagement', category: 'Engagement' },
  
  // Visit frequency segments
  { id: 'visit:first_time', name: 'First-time Visitors', category: 'Visit' },
  { id: 'visit:today', name: 'Visited Today', category: 'Visit' },
  { id: 'visit:last_week', name: 'Visited Last Week', category: 'Visit' },
  { id: 'visit:last_month', name: 'Visited Last Month', category: 'Visit' },
  { id: 'visit:inactive', name: 'Inactive Visitors', category: 'Visit' }
];

// Targeting operators for creating custom segments
const TARGETING_OPERATORS = [
  { id: 'equals', name: 'Equals', applicableTypes: ['string', 'number', 'date'] },
  { id: 'notEquals', name: 'Not Equals', applicableTypes: ['string', 'number', 'date'] },
  { id: 'contains', name: 'Contains', applicableTypes: ['string'] },
  { id: 'notContains', name: 'Does Not Contain', applicableTypes: ['string'] },
  { id: 'greaterThan', name: 'Greater Than', applicableTypes: ['number', 'date'] },
  { id: 'lessThan', name: 'Less Than', applicableTypes: ['number', 'date'] },
  { id: 'before', name: 'Before', applicableTypes: ['date'] },
  { id: 'after', name: 'After', applicableTypes: ['date'] }
];

// Available fields for targeting
const TARGETING_FIELDS = [
  // Visitor data
  { id: 'email', name: 'Email Address', type: 'string', category: 'Visitor' },
  { id: 'deviceType', name: 'Device Type', type: 'string', category: 'Visitor', values: ['mobile', 'desktop', 'tablet'] },
  { id: 'browser', name: 'Browser', type: 'string', category: 'Visitor', values: ['chrome', 'firefox', 'safari', 'edge'] },
  { id: 'referrer', name: 'Referrer', type: 'string', category: 'Visitor' },
  { id: 'pageViews', name: 'Page Views', type: 'number', category: 'Behavior' },
  { id: 'timeOnSite', name: 'Time on Site (seconds)', type: 'number', category: 'Behavior' },
  { id: 'lastVisit', name: 'Last Visit Date', type: 'date', category: 'Behavior' },
  
  // HubSpot fields
  { id: 'hubspot.industry', name: 'Industry', type: 'string', category: 'HubSpot' },
  { id: 'hubspot.company_size', name: 'Company Size', type: 'string', category: 'HubSpot' },
  { id: 'hubspot.customer_tier', name: 'Customer Tier', type: 'string', category: 'HubSpot' },
  { id: 'hubspot.lifecyclestage', name: 'Lifecycle Stage', type: 'string', category: 'HubSpot' },
  { id: 'hubspot.total_revenue', name: 'Total Revenue', type: 'number', category: 'HubSpot' }
];

// Function to create a segment builder UI
function createSegmentBuilderUI(container, workspaceId, onSave) {
  // Create segment builder container
  const builder = document.createElement('div');
  builder.className = 'cursor-segment-builder';
  builder.innerHTML = `
    <h3>Create Custom Segment</h3>
    <div class="form-group">
      <label>Segment ID:</label>
      <input type="text" id="segment-id" placeholder="my-custom-segment" required>
    </div>
    <div class="form-group">
      <label>Segment Name:</label>
      <input type="text" id="segment-name" placeholder="My Custom Segment" required>
    </div>
    <div class="form-group">
      <label>Rules:</label>
      <div id="rules-container"></div>
      <button id="add-rule" class="button-secondary">+ Add Rule</button>
    </div>
    <div class="form-actions">
      <button id="save-segment" class="button-primary">Save Segment</button>
      <button id="cancel-segment" class="button-secondary">Cancel</button>
    </div>
  `;
  
  container.appendChild(builder);
  
  // Initialize with one rule
  addRule();
  
  // Set up event listeners
  document.getElementById('add-rule').addEventListener('click', addRule);
  document.getElementById('save-segment').addEventListener('click', saveSegment);
  document.getElementById('cancel-segment').addEventListener('click', () => {
    container.removeChild(builder);
  });
  
  // Function to add a rule
  function addRule() {
    const rulesContainer = document.getElementById('rules-container');
    const ruleIndex = rulesContainer.children.length;
    
    const ruleDiv = document.createElement('div');
    ruleDiv.className = 'rule';
    ruleDiv.innerHTML = `
      <div class="rule-header">
        <span>Rule #${ruleIndex + 1}</span>
        <button class="remove-rule" data-index="${ruleIndex}">✕</button>
      </div>
      <div class="rule-content">
        <select class="field-select" data-index="${ruleIndex}">
          <option value="">Select Field</option>
          ${createFieldOptions()}
        </select>
        <select class="operator-select" data-index="${ruleIndex}" disabled>
          <option value="">Select Operator</option>
        </select>
        <input type="text" class="value-input" data-index="${ruleIndex}" placeholder="Value" disabled>
      </div>
    `;
    
    rulesContainer.appendChild(ruleDiv);
    
    // Add event listeners for this rule
    const fieldSelect = ruleDiv.querySelector('.field-select');
    const operatorSelect = ruleDiv.querySelector('.operator-select');
    const valueInput = ruleDiv.querySelector('.value-input');
    
    fieldSelect.addEventListener('change', () => {
      const selectedField = TARGETING_FIELDS.find(f => f.id === fieldSelect.value);
      
      if (selectedField) {
        // Update operators based on field type
        operatorSelect.innerHTML = `
          <option value="">Select Operator</option>
          ${TARGETING_OPERATORS
            .filter(op => op.applicableTypes.includes(selectedField.type))
            .map(op => `<option value="${op.id}">${op.name}</option>`)
            .join('')}
        `;
        operatorSelect.disabled = false;
        
        // If the field has predefined values, update the value input
        if (selectedField.values) {
          const valueSelect = document.createElement('select');
          valueSelect.className = 'value-input';
          valueSelect.dataset.index = ruleIndex;
          
          valueSelect.innerHTML = `
            <option value="">Select Value</option>
            ${selectedField.values.map(v => `<option value="${v}">${v}</option>`).join('')}
          `;
          
          valueInput.parentNode.replaceChild(valueSelect, valueInput);
        } else {
          // Set the right input type
          if (selectedField.type === 'date') {
            valueInput.type = 'date';
          } else if (selectedField.type === 'number') {
            valueInput.type = 'number';
          } else {
            valueInput.type = 'text';
          }
          valueInput.disabled = false;
        }
      } else {
        operatorSelect.innerHTML = '<option value="">Select Operator</option>';
        operatorSelect.disabled = true;
        valueInput.disabled = true;
      }
    });
    
    operatorSelect.addEventListener('change', () => {
      valueInput.disabled = !operatorSelect.value;
    });
    
    ruleDiv.querySelector('.remove-rule').addEventListener('click', () => {
      rulesContainer.removeChild(ruleDiv);
      // Renumber the rules
      Array.from(rulesContainer.querySelectorAll('.rule')).forEach((rule, idx) => {
        rule.querySelector('.rule-header span').textContent = `Rule #${idx + 1}`;
      });
    });
  }
  
  // Function to create options for the field select
  function createFieldOptions() {
    let options = '';
    const categories = [...new Set(TARGETING_FIELDS.map(f => f.category))];
    
    categories.forEach(category => {
      options += `<optgroup label="${category}">`;
      TARGETING_FIELDS.filter(f => f.category === category).forEach(field => {
        options += `<option value="${field.id}">${field.name}</option>`;
      });
      options += '</optgroup>';
    });
    
    return options;
  }
  
  // Function to save segment
  async function saveSegment() {
    const id = document.getElementById('segment-id').value;
    const name = document.getElementById('segment-name').value;
    
    if (!id || !name) {
      alert('Segment ID and Name are required');
      return;
    }
    
    // Collect rules
    const rules = [];
    const rulesContainer = document.getElementById('rules-container');
    
    for (let i = 0; i < rulesContainer.children.length; i++) {
      const ruleDiv = rulesContainer.children[i];
      const field = ruleDiv.querySelector('.field-select').value;
      const operator = ruleDiv.querySelector('.operator-select').value;
      const valueElement = ruleDiv.querySelector('.value-input');
      const value = valueElement.value;
      
      if (!field || !operator || !value) {
        alert(`Rule #${i + 1} is incomplete`);
        return;
      }
      
      rules.push({ field, operator, value });
    }
    
    // Save segment to API
    try {
      const response = await fetch(`/api/manage-segments?workspaceId=${workspaceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.CURSOR_EDITOR_KEY || editorKey
        },
        body: JSON.stringify({
          id,
          name,
          rules
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error saving segment: ${response.status}`);
      }
      
      const result = await response.json();
      alert(result.message || 'Segment saved successfully');
      
      // Remove builder from container
      container.removeChild(builder);
      
      // Call onSave callback if provided
      if (typeof onSave === 'function') {
        onSave();
      }
    } catch (error) {
      console.error('Error saving segment:', error);
      alert(`Failed to save segment: ${error.message}`);
    }
  }
}

// Function to load custom segments for a workspace
async function loadCustomSegments(workspaceId, apiKey) {
  try {
    const response = await fetch(`/api/manage-segments?workspaceId=${workspaceId}`, {
      headers: {
        'x-api-key': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error loading segments: ${response.status}`);
    }
    
    const data = await response.json();
    return data.segments || [];
  } catch (error) {
    console.error('Error loading custom segments:', error);
    return [];
  }
}

// Export the functions and constants
window.CURSOR_ADVANCED_TARGETING = {
  ENHANCED_USER_TYPES,
  TARGETING_OPERATORS,
  TARGETING_FIELDS,
  createSegmentBuilderUI,
  loadCustomSegments
};