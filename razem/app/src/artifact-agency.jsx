// Single-file hosted build of the agency area only (separate page from the traveller app).
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/onest/500.css';
import '@fontsource/onest/700.css';
import '@fontsource/onest/800.css';
import '@fontsource/jetbrains-mono/700.css';

window.__RAZEM_EMBED = true;
const style = document.createElement('style');
style.textContent = ":root{color-scheme:light}html,body{background:#F4F1EA}body{margin:0;font-family:'Onest',system-ui,sans-serif;color:#16181D;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}";
document.head.appendChild(style);
import('./agency.jsx').then(({ default: Agency }) => createRoot(document.getElementById('root')).render(<Agency />));
