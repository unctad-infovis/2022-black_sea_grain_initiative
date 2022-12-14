import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './jsx/App.jsx';
import AppV2 from './jsx/AppV2.jsx';
import Banner from './jsx/components/Banner.jsx';

const containerv2 = document.getElementById('app-root-2022-black_sea_grain_initiative_v2');
if (containerv2) {
  const root = createRoot(containerv2);
  root.render(<AppV2 />);
}

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
