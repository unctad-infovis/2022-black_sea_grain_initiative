import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './jsx/App.jsx';
import Banner from './jsx/Banner.jsx';

const container = document.getElementById('app-root-2022-black_sea_grain_initiative');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

const banner = document.getElementById('app-root-2022-black_sea_grain_initiative_banner');
if (banner) {
  const root = createRoot(banner);
  root.render(<Banner />);
}
