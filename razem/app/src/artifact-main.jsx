// Single-file hosted build: the traveller app, or the agency area when the address ends with #agenzia.
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/onest/400.css';
import '@fontsource/onest/500.css';
import '@fontsource/onest/600.css';
import '@fontsource/onest/700.css';
import '@fontsource/onest/800.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './global.css';
import './artifact.css';

window.__RAZEM_EMBED = true;
const root = createRoot(document.getElementById('root'));
let current = null;
async function show() {
  const agency = location.hash.replace('#', '') === 'agenzia';
  if (agency === current) return;
  current = agency;
  document.documentElement.classList.toggle('rz-agency', agency);
  const C = agency ? (await import('./agency.jsx')).default : (await import('./App.jsx')).default;
  root.render(<C key={agency ? 'a' : 'app'} />);
}
window.addEventListener('hashchange', show);
show();
