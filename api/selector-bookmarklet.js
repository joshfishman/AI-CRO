/* eslint-disable */
(function () {
  if (window.__selectorToolActive) return;
  window.__selectorToolActive = true;

  const apiBase = 'https://ai-cro-eight.vercel.app';
  const panel = document.createElement('div');
  panel.style = `
    position:fixed;top:10px;right:10px;z-index:2147483647;
    background:#fff;padding:10px;border:1px solid #ccc;
    font-family:sans-serif;width:320px;box-shadow:0 2px 8px rgba(0,0,0,.15)`;
  panel.innerHTML = `
    <h3 style="margin-top:0">AI Personalization Tool</h3>
    <p><strong>1.</strong> Click page element</p>
    <textarea id="st-prompt" style="width:100%;height:60px"></textarea>
    <button id="st-add">➕ Add</button>
    <hr>
    <button id="st-preview">👁️ Preview</button>
    <button id="st-push" style="float:right;background:#4caf50;color:#fff">⬆ Push</button>
  `;
  document.body.appendChild(panel);

  const promptBox = panel.querySelector('#st-prompt');
  const state = { selectors: [], el: null };

  document.body.addEventListener(
    'click',
    e => {
      if (e.target.closest('div') === panel) return;
      e.preventDefault();
      e.stopPropagation();
      state.el?.style?.setProperty('outline', '');
      state.el = e.target;
      state.el.style.outline = '2px solid red';
      promptBox.focus();
    },
    true
  );

  panel.querySelector('#st-add').onclick = () => {
    if (!state.el) return alert('Click an element first');
    const selector = state.el.id
      ? '#' + state.el.id
      : state.el.tagName.toLowerCase() +
        (state.el.className ? '.' + state.el.className.trim().split(/\s+/).join('.') : '');
    state.selectors.push({
      selector,
      prompt: promptBox.value,
      default: state.el.textContent.trim()
    });
    state.el.style.outline = '';
    state.el = null;
    promptBox.value = '';
    alert('Selector added');
  };

  panel.querySelector('#st-preview').onclick = async () => {
    if (!state.selectors.length) return alert('Add at least one selector');
    const resp = await fetch(apiBase + '/api/personalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userType: 'preview', selectors: state.selectors, dry: true })
    }).then(r => r.json());
    console.log('Preview variants', resp.variants);
    alert(JSON.stringify(resp.variants, null, 2));
  };

  panel.querySelector('#st-push').onclick = async () => {
    if (!state.selectors.length) return alert('Add selectors first');
    const payload = { url: window.location.pathname, selectors: state.selectors };
    const ok = await fetch(apiBase + '/api/save-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_EDITOR_API_KEY'
      },
      body: JSON.stringify(payload)
    }).then(r => r.ok);
    ok ? alert('✅ Config saved') : alert('❌ Push failed');
  };
})();