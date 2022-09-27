import React, { useState, useEffect } from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';
import * as d3 from 'd3';

// Load helpers.
import CSVtoJSON from './helpers/CSVtoJSON.js';
import LineChart from './helpers/LineChart.jsx';
import TreeMapChart from './helpers/TreeMapChart.jsx';
import DonutChart from './helpers/DonutChart.jsx';
import LineBarChart from './helpers/LineBarChart.jsx';
import slideToggle from './helpers/slideToggle.js';

const appID = '#app-root-2022-black_sea_grain_initiative';

function App() {
  // Data states.
  const [data, setData] = useState(false);
  const [totalTonnage, setTotalTonnage] = useState(0);
  const [totalShips, setTotalShips] = useState(0);

  const [commodities, setCommodities] = useState([]);
  const [commodityValue, setCommodityValue] = useState(false);
  const [countries, setCountries] = useState([]);
  const [countryValue, setCountryValue] = useState(false);
  const [countryStatusValue, setCountryStatusValue] = useState(false);
  const [duration, setDuration] = useState(0);
  const [features, setFeatures] = useState(false);
  const [countryCountryStatus, setCountryCountryStatus] = useState(false);
  const [topCommodities, setTopCommodities] = useState([]);
  const [topCommoditiesFull, setTopCommoditiesFull] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [topCountriesFull, setTopCountriesFull] = useState([]);
  const [updated, setUpdated] = useState(false);

  const [totalPerProduct, setTotalPerProduct] = useState(false);
  const [totalPerCountry, setTotalPerCountry] = useState(false);
  const [totalPerCountryStatus, setTotalPerCountryStatus] = useState(false);
  const [dates, setDates] = useState({});

  // Helper functions.
  const daysBetween = (date_1, date_2) => Math.ceil((date_1.getTime() - date_2.getTime()) / (1000 * 3600 * 24) + 1);
  const dateRange = (start_date, num_of_days) => {
    const start_dateInMs = start_date.getTime() - start_date.getTimezoneOffset('GMT') * 600000;
    return [...Array(num_of_days).keys()].map(i => new Date(start_dateInMs + i * (24 * 60 * 60 * 1000)).toISOString().slice(0, 10));
  };

  const defineData = () => {
    const output = [];
    if (commodityValue === false && countryValue === false && countryStatusValue === false) {
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
          if (commodityValue !== false && countryStatusValue !== false) {
            if (commodityValue === 'Other') {
              return !topCommodities.includes(a.Commodity) && a['Country status'] === countryStatusValue;
            }
            return a.Commodity === commodityValue && a['Country status'] === countryStatusValue;
          }
          if (commodityValue !== false) {
            if (commodityValue === 'Other') {
              return !topCommodities.includes(a.Commodity);
            }
            return a.Commodity === commodityValue;
          }
          if (countryValue !== false) {
            if (countryValue === 'Other') {
              return !topCountries.includes(a.Country);
            }
            return a.Country === countryValue;
          }
          if (countryStatusValue !== false) {
            return a['Country status'] === countryStatusValue;
          }
          return true;
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
      }, [])));
      setTopCommoditiesFull(top_commodities_full);
      setTopCommodities(top_commodities);

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
      }, [])));
      setTopCountriesFull(top_countries_full);
      setTopCountries(top_countries);

      // Total daily per country status.
      setTotalPerCountryStatus(Object.values(Object.values(data.reduce((acc, it) => {
        acc[it['Country status']] = [it['Country status'], (acc[it['Country status']]?.[1] || 0) + parseFloat(it.Tonnage)];
        return acc;
      }, {})).sort((a, b) => b[1] - a[1]).reduce((acc, it) => {
        acc[it[0]] = { name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) };
        return acc;
      }, [])));
    }
  }, [data, dates]);
  // eslint-disable-next-line
  const easingFn = (t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b;

  const toggleFeatures = () => {
    if (features === false) {
      document.querySelectorAll('.extra').forEach(el => el.classList.add('enabled'));
      d3.select('path.extra.line').attr('class', 'line extra enabled');
    } else {
      document.querySelectorAll('.extra').forEach(el => el.classList.remove('enabled'));
      setCommodityValue(false);
      setCountryValue(false);
    }
    setFeatures(features === false);
  };

  const toggleCountryCountryStatus = () => {
    if (countryCountryStatus === false) {
      document.querySelectorAll('.countries_wrapper')[0].style.height = 'auto';
      document.querySelectorAll('.countries_wrapper')[0].style.opacity = 1;
      document.querySelectorAll('.countries_wrapper')[0].style.visibility = 'visible';
      document.querySelectorAll('.country_status_wrapper')[0].style.height = 0;
      document.querySelectorAll('.country_status_wrapper')[0].style.opacity = 0;
      document.querySelectorAll('.country_status_wrapper')[0].style.visibility = 'hidden';
      setCountryStatusValue(false);
    } else {
      document.querySelectorAll('.countries_wrapper')[0].style.height = 0;
      document.querySelectorAll('.countries_wrapper')[0].style.opacity = 0;
      document.querySelectorAll('.countries_wrapper')[0].style.visibility = 'hidden';
      document.querySelectorAll('.country_status_wrapper')[0].style.height = 'auto';
      document.querySelectorAll('.country_status_wrapper')[0].style.opacity = 1;
      document.querySelectorAll('.country_status_wrapper')[0].style.visibility = 'visible';
      setCountryValue(false);
    }
    setCountryCountryStatus((countryCountryStatus === false));
  };

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
          <h3><CountUp easingFn={easingFn} end={totalTonnage} duration={4} separator="," useEasing /></h3>
          <h4>Total metric tons carried</h4>
          {(data) && (<LineChart appID={appID} idx="0" series={defineData().map(el => el[2])} />)}
          <h3><CountUp easingFn={easingFn} end={totalShips} duration={4} separator="," useEasing /></h3>
          <h4>Vessels departed</h4>
          <h5>{(updated) && `As of ${updated.getDate()}  ${updated.toLocaleString('default', { month: 'long' })} ${updated.getFullYear()} ` }</h5>
        </div>
      </div>
      { /* Visualisations container */ }
      <div className="visualisations_container">
        <div className="vis_row vis_row_1">
          <div className="toggle_features_container"><button type="button" onClick={(event) => toggleFeatures(event)}>{(features === false) ? 'Play with the data' : 'Hide features'}</button></div>
          <h3>
            <span className="highlight">How much</span>
            {' '}
            has been shipped daily?
          </h3>
          {(data) && (<LineBarChart appID={appID} commodities={commodities} commodityValue={commodityValue} countries={countries} countryValue={countryValue} countryStatusValue={countryStatusValue} features={features} defineData={defineData} duration={duration} easingFn={easingFn} idx="1" setCommodityValue={setCommodityValue} setCountryValue={setCountryValue} setDuration={setDuration} />)}
        </div>
        <div className="vis_row vis_row_2">
          <div className="column column_1">
            <h4>
              <span className="highlight">What</span>
              {' '}
              are the main products carried?
            </h4>
            <div className="instruction extra">Choose a commodity of interest</div>
            {totalPerProduct && (<DonutChart category="Commodity" commodityValue={commodityValue} countryValue={countryValue} countryStatusValue={countryStatusValue} idx="5" series={totalPerProduct} setCommodityValue={setCommodityValue} setCountryValue={setCountryValue} setCountryStatusValue={setCountryStatusValue} setDuration={setDuration} />)}
            <div style={{ display: 'none' }}>{totalPerProduct && (<TreeMapChart category="Commodity" commodityValue={commodityValue} countryValue={countryValue} idx="2" series={totalPerProduct} setCommodityValue={setCommodityValue} setCountryValue={setCountryValue} setDuration={setDuration} />)}</div>
            <div className="list_container_toggle"><button onClick={() => slideToggle(document.querySelectorAll('.list_container_commodity')[0])} type="button">Show other products</button></div>
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
                      <td><button onClick={() => { setCommodityValue((el.name === commodityValue) ? false : el.name); setDuration(1000); }} type="button">{el.name}</button></td>
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
            <div className="toggle_features_container"><button type="button" onClick={(event) => toggleCountryCountryStatus(event)}>{(countryCountryStatus === false) ? 'See per country' : 'Return'}</button></div>
            <div className="country_status_wrapper">
              {totalPerCountryStatus && (<DonutChart category="CountryStatus" commodityValue={commodityValue} countryValue={countryValue} countryStatusValue={countryStatusValue} idx="5" series={totalPerCountryStatus} setCommodityValue={setCommodityValue} setCountryValue={setCountryValue} setCountryStatusValue={setCountryStatusValue} setDuration={setDuration} />)}
            </div>
            <div className="countries_wrapper" style={{ height: 0, opacity: 0, visibility: 'hidden' }}>
              <div className="instruction extra">Choose a destination of interest</div>
              {totalPerCountry && (<TreeMapChart category="Country" commodityValue={commodityValue} countryValue={countryValue} idx="3" series={totalPerCountry} setCommodityValue={setCommodityValue} setCountryValue={setCountryValue} setDuration={setDuration} />)}
              <div className="list_container_toggle"><button onClick={() => slideToggle(document.querySelectorAll('.list_container_country')[0])} type="button">Show other destinations</button></div>
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
                        <td><button onClick={() => { setCountryValue((el.name === countryValue) ? false : el.name); setDuration(1000); }} type="button">{el.name}</button></td>
                        <td>{el.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      { /* Table container */ }
      <div className="table_container">
        <h3>Browse the data</h3>
        <iframe aria-label="Interactive table" frameBorder="0" height="auto" loading="lazy" scrolling="no" src="https://datawrapper.dwcdn.net/z1IW9" title="Outbound vessels" />
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
