import React, { useState, useEffect } from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';

// Load helpers.
import CSVtoJSON from './helpers/CSVtoJSON.js';
import LineChart from './helpers/LineChart.jsx';
import TreeMapChart from './helpers/TreeMapChart.jsx';
import LineBarChart from './helpers/LineBarChart.jsx';
// import roundNr from './helpers/RoundNr.js';

const appID = '#app-root-2022-black_sea_grain_initiative';

function App() {
  // Data states.
  const [data, setData] = useState(false);
  const [type, setType] = useState(false);
  const [value, setValue] = useState(false);
  const [durationExt, setDurationExt] = useState(0);
  const [topCountries, setTopCountries] = useState([]);
  const [topCommodities, setTopCommodities] = useState([]);
  const [updated, setUpdated] = useState(false);

  const [totalTonnage, setTotalTonnage] = useState(0);
  const [totalShips, setTotalShips] = useState(0);

  const [totalPerProduct, setTotalPerProduct] = useState(false);
  const [totalPerCountry, setTotalPerCountry] = useState(false);
  const [dates, setDates] = useState({});

  // Helper functions.
  const daysBetween = (date_1, date_2) => Math.ceil((date_1.getTime() - date_2.getTime()) / (1000 * 3600 * 24) + 1);
  const dateRange = (start_date, num_of_days) => {
    const start_dateInMs = start_date.getTime() - start_date.getTimezoneOffset('GMT') * 600000;
    return [...Array(num_of_days).keys()].map(i => new Date(start_dateInMs + i * (24 * 60 * 60 * 1000)).toISOString().slice(0, 10));
  };

  const defineData = (selected_type = false, selected_value = false) => {
    const output = [];
    if (selected_type === false) {
      Object.values({
        ...structuredClone(dates),
        ...data.reduce((acc, it) => {
          const date = (new Date(`${it.Departure} 12:00:00 GMT`)).toISOString().slice(0, 10);
          acc[date] = [date, (acc[date]?.[1] || 0) + parseFloat(it.Tonnage)];
          return acc;
        }, {})
      }).reduce((a, b, i) => {
        output[i] = [b[0], b[1], b[1] + (a[2] || 0), i];
        return [b[0], b[1], b[1] + (a[2] || 0), i];
      }, []);
    } else if (selected_value !== false) {
      Object.values({
        ...structuredClone(dates),
        ...data.filter(a => {
          if (selected_value === 'Other') {
            return (selected_type === 'Country') ? !topCountries.includes(a[selected_type]) : !topCommodities.includes(a[selected_type]);
          }
          return a[selected_type] === selected_value;
        }).reduce((acc, it) => {
          const date = (new Date(`${it.Departure} 12:00:00 GMT`)).toISOString().slice(0, 10);
          acc[date] = [date, (acc[date]?.[1] || 0) + parseFloat(it.Tonnage)];
          return acc;
        }, {})
      }).reduce((a, b, i) => {
        output[i] = [b[0], b[1], b[1] + (a[2] || 0), i];
        return [b[0], b[1], b[1] + (a[2] || 0), i];
      }, []);
    }
    return output;
  };

  useEffect(() => {
    const data_file = (window.location.href.includes('unctad.org')) ? '/sites/default/files/data-file/2022-black_sea_grain_initiative.csv' : './assets/data/data - data.csv';
    try {
      fetch(data_file, { method: 'GET' })
        .then(response => response.text())
        .then(body => {
          const json_data = CSVtoJSON(body);
          setData(json_data);
          setDates(dateRange(new Date(json_data[0].Departure), daysBetween(new Date(json_data[json_data.length - 1].Departure), new Date(json_data[0].Departure))).reduce((a, v) => ({ ...a, [v]: [v, 0] }), {}));
          setUpdated(new Date(json_data[json_data.length - 1].Departure));
        });
    } catch (error) {
      console.error(error);
    }

    // eslint-disable-next-line no-unused-expressions,func-names
    !(function () {
      // eslint-disable-next-line no-restricted-syntax,no-void,guard-for-in
      window.addEventListener('message', ((e) => { if (void 0 !== e.data['datawrapper-height']) { const t = document.querySelectorAll(`${appID} iframe`); for (const a in e.data['datawrapper-height']) for (let r = 0; r < t.length; r++) { if (t[r].contentWindow === e.source)t[r].style.height = `${e.data['datawrapper-height'][a]}px`; } } }));
    }());
  }, []);

  useEffect(() => {
    if (data !== false) {
      setTotalTonnage(data.reduce((acc, it) => acc + parseFloat(it.Tonnage), 0));
      setTotalShips(new Set(data.map(el => el['#'])).size);

      // Total daily per country.
      const top_countries = [];
      setTotalPerCountry(Object.values(Object.values(data.reduce((acc, it) => {
        acc[it.Country] = [it.Country, (acc[it.Country]?.[1] || 0) + parseFloat(it.Tonnage)];
        return acc;
      }, {})).sort((a, b) => b[1] - a[1]).reduce((acc, it, i) => {
        if (i >= 5) {
          acc.Other = { name: 'Other', parent: 'Origin', value: (acc.Other?.value || 0) + parseFloat(it[1]) };
        } else {
          top_countries.push(it[0]);
          acc[it[0]] = { name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) };
        }
        return acc;
      }, [{ name: 'Origin', parent: '', value: 0 }])));
      setTopCountries(top_countries);

      // Total daily per commodity.
      const top_commodities = [];
      setTotalPerProduct(Object.values(Object.values(data.reduce((acc, it) => {
        acc[it.Commodity] = [it.Commodity, (acc[it.Commodity]?.[1] || 0) + parseFloat(it.Tonnage)];
        return acc;
      }, {})).sort((a, b) => b[1] - a[1]).reduce((acc, it, i) => {
        if (i >= 3) {
          acc.Other = { name: 'Other', parent: 'Origin', value: (acc.Other?.value || 0) + parseFloat(it[1]) };
        } else {
          top_commodities.push(it[0]);
          acc[it[0]] = { name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) };
        }
        return acc;
      }, [{ name: 'Origin', parent: '', value: 0 }])));
      setTopCommodities(top_commodities);
    }
  }, [data, dates, setTopCountries, setTopCommodities]);
  // eslint-disable-next-line
  const easingFn = (t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b;
  return (
    <div className="app">
      { /* Banner container */ }
      <h2>
        Black Sea Grain Initiative
        {' '}
        <span className="highlight">in numbers</span>
      </h2>
      { /* Banner container */ }
      <div className="header_container_outer">
        <div className="header_container">
          <h3><CountUp separator="," end={totalTonnage} duration={4} useEasing easingFn={easingFn} /></h3>
          <h4>Total metric tons carried</h4>
          {(data) && (<LineChart appID={appID} idx="0" series={defineData(false, false).map(el => el[2])} />)}
          <h3><CountUp separator="," end={totalShips} duration={4} useEasing easingFn={easingFn} /></h3>
          <h4>Vessels departed</h4>
          <h5>{(updated) && `As of ${updated.getDate()}  ${updated.toLocaleString('default', { month: 'long' })} ${updated.getFullYear()} ` }</h5>
        </div>
      </div>
      { /* Visualisations container */ }
      <div className="visualisations_container">
        <div className="vis_row vis_row_1">
          <h3>
            <span className="highlight">How much</span>
            {' '}
            has been shipped daily?
          </h3>
          {(data) && (<LineBarChart appID={appID} idx="1" defineData={defineData} durationExt={durationExt} type={type} value={value} />)}
        </div>
        <div className="vis_row vis_row_2">
          <div className="column column_1">
            <h4>
              <span className="highlight">What</span>
              {' '}
              are the main products carried?
            </h4>
            <div className="instruction">Choose a commodity of interest</div>
            {totalPerProduct && (<TreeMapChart category="Commodity" idx="2" series={totalPerProduct} setValue={setValue} setType={setType} setDurationExt={setDurationExt} />)}
          </div>
          <div className="column column_2">
            <h4>
              <span className="highlight">Where</span>
              {' '}
              has the cargo gone to?
            </h4>
            <div className="instruction">Choose a country of interest</div>
            {totalPerCountry && (<TreeMapChart category="Country" idx="3" series={totalPerCountry} setValue={setValue} setType={setType} setDurationExt={setDurationExt} />)}
          </div>
        </div>
      </div>
      { /* Table container */ }
      <div className="table_container">
        <h3>Browse the data</h3>
        <iframe loading="lazy" title="Outbound vessels" aria-label="Interactive table" src="https://datawrapper.dwcdn.net/z1IW9" scrolling="no" frameBorder="0" height="auto" />
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
