import React, { useState, useEffect } from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';

// Load helpers.
import CSVtoJSON from './helpers/CSVtoJSON.js';
import LineChart from './helpers/LineChart.jsx';
import TreeMapChart from './helpers/TreeMapChart.jsx';
import LineBarChart from './helpers/LineBarChart.jsx';
import slideToggle from './helpers/slideToggle.js';

const appID = '#app-root-2022-black_sea_grain_initiative';

function App() {
  // Data states.
  const [data, setData] = useState(false);
  const [commodityValue, setCommodityValue] = useState(false);
  const [countryValue, setCountryValue] = useState(false);
  const [duration, setDuration] = useState(0);
  const [topCountries, setTopCountries] = useState([]);
  const [topCountriesFull, setTopCountriesFull] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [topCommodities, setTopCommodities] = useState([]);
  const [topCommoditiesFull, setTopCommoditiesFull] = useState([]);
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

  const defineData = () => {
    const output = [];
    if (commodityValue === false && countryValue === false) {
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
    } else {
      Object.values({
        ...structuredClone(dates),
        ...data.filter(a => {
          if (commodityValue !== false && countryValue !== false) {
            if (commodityValue === 'Other' && countryValue === 'Other') {
              return !topCommodities.includes(a.Commodity) && !topCountries.includes(a.Country);
            }
            if (commodityValue === 'Other') {
              return !topCommodities.includes(a.Commodity) && a.Country === countryValue;
            }
            if (countryValue === 'Other') {
              return !topCommodities.includes(a.Country) && a.Commodity === commodityValue;
            }
            return a.Commodity === commodityValue && a.Country === countryValue;
          }
          if (commodityValue !== false) {
            if (commodityValue === 'Other') {
              return !topCommodities.includes(a.Commodity);
            }
            return a.Commodity === commodityValue;
          }

          if (countryValue === 'Other') {
            return !topCountries.includes(a.Country);
          }
          return a.Country === countryValue;
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
          setCommodities([...new Set(json_data.map(el => el.Commodity))].sort());
          setCountries([...new Set(json_data.map(el => el.Country))].sort());
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
      const top_countries_full = [];
      const top_countries = [];
      setTotalPerCountry(Object.values(Object.values(data.reduce((acc, it) => {
        acc[it.Country] = [it.Country, (acc[it.Country]?.[1] || 0) + parseFloat(it.Tonnage)];
        return acc;
      }, {})).sort((a, b) => b[1] - a[1]).reduce((acc, it, i) => {
        if (i >= 5) {
          top_countries_full.push({ name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) });
          acc.Other = { name: 'Other', parent: 'Origin', value: (acc.Other?.value || 0) + parseFloat(it[1]) };
        } else {
          top_countries.push(it[0]);
          acc[it[0]] = { name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) };
        }
        return acc;
      }, [{ name: 'Origin', parent: '', value: 0 }])));
      setTopCountries(top_countries);
      setTopCountriesFull(top_countries_full);

      // Total daily per commodity.
      const top_commodities_full = [];
      const top_commodities = [];
      setTotalPerProduct(Object.values(Object.values(data.reduce((acc, it) => {
        acc[it.Commodity] = [it.Commodity, (acc[it.Commodity]?.[1] || 0) + parseFloat(it.Tonnage)];
        return acc;
      }, {})).sort((a, b) => b[1] - a[1]).reduce((acc, it, i) => {
        if (i >= 3) {
          top_commodities_full.push({ name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) });
          acc.Other = { name: 'Other', parent: 'Origin', value: (acc.Other?.value || 0) + parseFloat(it[1]) };
        } else {
          top_commodities.push(it[0]);
          acc[it[0]] = { name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) };
        }
        return acc;
      }, [{ name: 'Origin', parent: '', value: 0 }])));
      setTopCommodities(top_commodities);
      setTopCommoditiesFull(top_commodities_full);
    }
  }, [data, dates]);
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
            has been shipped daily and in total?
          </h3>
          {(data) && (<LineBarChart appID={appID} idx="1" defineData={defineData} duration={duration} setDuration={setDuration} commodityValue={commodityValue} countryValue={countryValue} setCommodityValue={setCommodityValue} setCountryValue={setCountryValue} commodities={commodities} countries={countries} />)}
        </div>
        <div className="vis_row vis_row_2">
          <div className="column column_1">
            <h4>
              <span className="highlight">What</span>
              {' '}
              are the main products carried?
            </h4>
            <div className="instruction">Choose a commodity of interest</div>
            {totalPerProduct && (<TreeMapChart category="Commodity" idx="2" series={totalPerProduct} setCommodityValue={setCommodityValue} setCountryValue={setCountryValue} commodityValue={commodityValue} countryValue={countryValue} setDuration={setDuration} />)}
            <div className="list_container_toggle"><button type="button" onClick={() => slideToggle(document.querySelectorAll('.list_container_commodity')[0])}>Show other products</button></div>
            <div className="list_container list_container_commodity">
              <table>
                <thead>
                  <tr>
                    <th>Commodity</th>
                    <th>Metric tons</th>
                  </tr>
                </thead>
                <tbody>
                  {topCommoditiesFull && topCommoditiesFull.map(el => (
                    <tr key={el.name} className={(el.name === commodityValue) ? 'selected' : ''}>
                      <td><button type="button" onClick={() => { setDuration(1000); setCommodityValue((el.name === commodityValue) ? false : el.name); }}>{el.name}</button></td>
                      <td>{el.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="column column_2">
            <h4>
              <span className="highlight">Where</span>
              {' '}
              has the cargo gone to?
            </h4>
            <div className="instruction">Choose a destination of interest</div>
            {totalPerCountry && (<TreeMapChart category="Country" idx="3" series={totalPerCountry} setCommodityValue={setCommodityValue} setCountryValue={setCountryValue} commodityValue={commodityValue} countryValue={countryValue} setDuration={setDuration} />)}
            <div className="list_container_toggle"><button type="button" onClick={() => slideToggle(document.querySelectorAll('.list_container_country')[0])}>Show other destinations</button></div>
            <div className="list_container list_container_country">
              <table>
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Metric tons</th>
                  </tr>
                </thead>
                <tbody>
                  {topCountriesFull && topCountriesFull.map(el => (
                    <tr key={el.name} className={(el.name === countryValue) ? 'selected' : ''}>
                      <td><button type="button" onClick={() => { setDuration(1000); setCountryValue((el.name === countryValue) ? false : el.name); }}>{el.name}</button></td>
                      <td>{el.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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