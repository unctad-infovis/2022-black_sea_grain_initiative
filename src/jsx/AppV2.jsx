import React, { useEffect, useRef } from 'react';
import '../styles/styles_v2.less';

import Banner from './Banner.jsx';

function AppDatawrapper() {
  const appRef = useRef();

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions,func-names
    !(function () {
      // eslint-disable-next-line no-restricted-syntax,no-void,guard-for-in
      window.addEventListener('message', ((e) => { if (void 0 !== e.data['datawrapper-height']) { const t = appRef.current.querySelectorAll('iframe'); for (const a in e.data['datawrapper-height']) for (let r = 0; r < t.length; r++) { if (t[r].contentWindow === e.source)t[r].style.height = `${e.data['datawrapper-height'][a]}px`; } } }));
    }());
  }, []);
  return (
    <div className="app" ref={appRef}>
      <span className="stamp">Let&apos;s start with big numbers</span>
      <Banner standAlone />
      <div className="content_container">
        <div className="content_wrapper">
          <span className="stamp">We need to have an introduction</span>
          <div className="content">
            <h4>On 22 July, the United Nations, the Russian Federation, Türkiye and Ukraine agreed the Black Sea Grain Initiative, at a signing ceremony in Istanbul.</h4>
            <p>The initiative was set up to resume Ukrainian grain exports via the Black Sea amid the ongoing war. The UN plan, which also paves the way for Russian food and fertilizer to reach global markets, is helping to stabilize spiralling food prices worldwide and prevent a food crisis that could affect millions of people around the globe.</p>
            <p>This dashboard presents up-to-date statistics on what has been shipped under the initiative, how much has reached world markets, and how global prices of food has evolved.</p>
          </div>
        </div>
        <div className="content_wrapper wide">
          <span className="stamp">Next we want to show we are speeding up, weekly data?</span>
          <div className="content">
            <h3>
              <div className="highlight">How much</div>
              {' '}
              has been daily?
            </h3>
            <iframe title="Interactive chart" aria-label="Interactive chart" src="https://datawrapper.dwcdn.net/kWqCl/8/" scrolling="no" frameBorder="0" height="auto" className="bar_chart" />
          </div>
        </div>
        <div className="content_wrapper wide">
          <span className="stamp">We want to go deeper, what products and why these?</span>
          <div className="flex">
            <div className="content text">
              <h3>
                <div className="highlight">What</div>
                {' '}
                has been shipped?
              </h3>
              <p>Ukraine, one of the world’s largest grain exporters, normally supplies around 45 million tonnes of grain to the global market every year but, following Russia’s invasion of the country, in late February 2022, mountains of grains built up in silos, with ships unable to secure safe passage to and from Ukrainian ports, and land routes unable to compensate.</p>
            </div>
            <div className="content chart">
              <iframe title="What has been shipped?" aria-label="Donut Chart" id="datawrapper-chart-h4sMD" src="https://datawrapper.dwcdn.net/h4sMD/9/" scrolling="no" frameBorder="0" height="492" />
            </div>
          </div>
        </div>
        <div className="content_wrapper wide">
          <span className="stamp">We want to show the grain is going to everywhere</span>
          <div className="content text">
            <h3>
              <div className="highlight">Where</div>
              {' '}
              has the cargo gone?
            </h3>
          </div>
          <div className="flex">
            <div className="content chart">
              <iframe title="Where has the cargo gone?" aria-label="Donut Chart" id="datawrapper-chart-PbmkK" src="https://datawrapper.dwcdn.net/PbmkK/19/" scrolling="no" frameBorder="0" height="531" />
            </div>
            <div className="content chart">
              <iframe title="Where has cargo gone?" aria-label="Donut Chart" id="datawrapper-chart-oJTUC" src="https://datawrapper.dwcdn.net/oJTUC/15/" scrolling="no" frameBorder="0" height="492" />
            </div>
          </div>
        </div>
        <div className="content_wrapper wide">
          <span className="stamp">And we want to lift our tail showing affects=good</span>
          <div className="flex">
            <div className="content text">
              <h3>
                <div className="highlight">What</div>
                {' '}
                do we see happening?
              </h3>
              <p>FAO Food price index reached it&apos;s peak in March</p>
              <p>Currently the prices are going down and have reached the levels they had at the beginning of the year.</p>
            </div>
            <div className="content chart">
              <iframe title="Food prices" aria-label="Interactive line chart" id="datawrapper-chart-ZfGo4" src="https://datawrapper.dwcdn.net/ZfGo4/7/" scrolling="no" frameBorder="0" height="450" />
            </div>
          </div>
        </div>
        <div className="content_wrapper wide">
          <span className="stamp">And we also provide the raw data for experts</span>
          <div className="content text">
            <h3>
              <div className="highlight">Browse</div>
              {' '}
              the data per vessel
            </h3>
          </div>
          <div className="content chart">
            <iframe title="Vessel movement – Outbound voyages of grain to world markets" aria-label="Table" id="datawrapper-chart-MUWoW" src="https://datawrapper.dwcdn.net/MUWoW/9/" scrolling="no" frameBorder="0" width="1350" height="909" />
          </div>
        </div>
      </div>

    </div>
  );
}

export default AppDatawrapper;
