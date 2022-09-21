import React, { useState, useEffect } from 'react';
import '../styles/styles.less';

// Load helpers.
import CSVtoJSON from './helpers/CSVtoJSON.js';
import formatNr from './helpers/FormatNr.js';
import LineChart from './helpers/LineChart.jsx';
// import roundNr from './helpers/RoundNr.js';

const appID = '#app-root-2022-black_sea_grain_initiative';

function App() {
  // Data states.
  const [data, setData] = useState(false);
  const [totalTonnage, setTotalTonnage] = useState(0);
  const [totalCornTonnage, setTotalCornTonnage] = useState(0);
  const [totalWheatTonnage, setTotalWheatTonnage] = useState(0);
  const [totalOtherTonnage, setTotalOtherTonnage] = useState(0);

  const [totalDaily, setTotalDaily] = useState(false);
  const [totalCornDaily, setTotalCornDaily] = useState(false);
  const [totalWheatDaily, setTotalWheatDaily] = useState(false);
  const [totalOtherDaily, setTotalOtherDaily] = useState(false);

  const [totalDestination, setTotalDestination] = useState({});
  const [totalCornDestination, setTotalCornDestination] = useState({});
  const [totalWheatDestination, setTotalWheatDestination] = useState({});
  const [totalOtherDestination, setTotalOtherDestination] = useState({});

  const [totalShips, setTotalShips] = useState(0);
  const [totalCornShips, setTotalCornShips] = useState(0);
  const [totalWheatShips, setTotalWheatShips] = useState(0);
  const [totalOtherShips, setTotalOtherShips] = useState(0);

  const [dates, setDates] = useState(0);

  const daysBetween = (date_1, date_2) => Math.ceil((date_1.getTime() - date_2.getTime()) / (1000 * 3600 * 24) + 1);
  const dateRange = (start_date, num_of_days) => {
    const start_dateInMs = start_date.getTime() - start_date.getTimezoneOffset('GMT') * 600000;
    return [...Array(num_of_days).keys()].map(i => new Date(start_dateInMs + i * (24 * 60 * 60 * 1000)).toISOString().slice(0, 10));
  };

  useEffect(() => {
    const data_file = (window.location.href.includes('unctad.org')) ? '/sites/default/files/data-file/2022-black_sea_grain_initiative.csv' : './assets/data/data - data.csv';
    try {
      fetch(data_file, { method: 'GET' })
        .then(response => response.text())
        .then(body => {
          const json_data = CSVtoJSON(body);
          setData(json_data);
          setDates(dateRange(new Date(json_data[0].Departure), daysBetween(new Date(json_data[json_data.length - 1].Departure), new Date(json_data[0].Departure))).reduce((a, v) => ({ ...a, [v]: 0 }), {}));
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

  // let myarray = [5, 10, 3, 2];
  //     let new_array = [];
  //     myarray.reduce( (prev, curr,i) =>  new_array[i] = prev + curr , 0 )
  //     console.log(new_array);

  useEffect(() => {
    if (data !== false) {
      setTotalTonnage(data.reduce((a, b) => a + parseFloat(b.Tonnage), 0));
      setTotalCornTonnage(data.filter(a => a.Commodity === 'Corn').reduce((a, b) => a + parseFloat(b.Tonnage), 0));
      setTotalWheatTonnage(data.filter(a => a.Commodity === 'Wheat').reduce((a, b) => a + parseFloat(b.Tonnage), 0));
      setTotalOtherTonnage(data.filter(a => (a.Commodity !== 'Corn' && a.Commodity !== 'Wheat')).reduce((a, b) => a + parseFloat(b.Tonnage), 0));

      setTotalShips(new Set(data.map(el => el['#'])).size);
      setTotalCornShips(new Set(data.filter(a => a.Commodity === 'Corn').map(el => el['#'])).size);
      setTotalWheatShips(new Set(data.filter(a => a.Commodity === 'Wheat').map(el => el['#'])).size);
      setTotalOtherShips(new Set(data.filter(a => (a.Commodity !== 'Corn' && a.Commodity !== 'Wheat')).map(el => el['#'])).size);

      setTotalDestination(Object.entries(data.reduce((acc, it) => {
        acc[it.Country] = acc[it.Country] + parseFloat(it.Tonnage) || 0;
        return acc;
      }, {})).sort(([, a], [, b]) => b - a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {}));

      setTotalCornDestination(Object.entries(data.filter(a => a.Commodity !== 'Corn').reduce((acc, it) => {
        acc[it.Country] = acc[it.Country] + parseFloat(it.Tonnage) || 0;
        return acc;
      }, {})).sort(([, a], [, b]) => b - a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {}));

      setTotalWheatDestination(Object.entries(data.filter(a => a.Commodity === 'Wheat').reduce((acc, it) => {
        acc[it.Country] = acc[it.Country] + parseFloat(it.Tonnage) || 0;
        return acc;
      }, {})).sort(([, a], [, b]) => b - a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {}));

      setTotalOtherDestination(Object.entries(data.filter(a => (a.Commodity !== 'Corn' && a.Commodity !== 'Wheat')).reduce((acc, it) => {
        acc[it.Country] = acc[it.Country] + parseFloat(it.Tonnage) || 0;
        return acc;
      }, {})).sort(([, a], [, b]) => b - a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {}));

      // Total daily
      const temp_total = structuredClone(dates);
      data.reduce((acc, it) => {
        const date = new Date(`${it.Departure} 12:00:00 GMT`);
        temp_total[date.toISOString().slice(0, 10)] = acc[it.Departure] + parseFloat(it.Tonnage) || 0;
        acc[it.Departure] = acc[it.Departure] + parseFloat(it.Tonnage) || 0;
        return acc;
      }, {});
      const temp_total_2 = [];
      Object.values(temp_total).reduce((a, b, i) => {
        temp_total_2[i] = parseFloat(a) + parseFloat(b);
        return temp_total_2[i];
      }, 0);
      setTotalDaily(temp_total_2);

      // Corn daily
      const temp_corn = structuredClone(dates);
      data.filter(a => a.Commodity === 'Corn').reduce((acc, it) => {
        const date = new Date(`${it.Departure} 12:00:00 GMT`);
        temp_corn[date.toISOString().slice(0, 10)] = acc[it.Departure] + parseFloat(it.Tonnage) || 0;
        acc[it.Departure] = acc[it.Departure] + parseFloat(it.Tonnage) || 0;
        return acc;
      }, {});
      const temp_corn_2 = [];
      Object.values(temp_corn).reduce((a, b, i) => {
        temp_corn_2[i] = parseFloat(a) + parseFloat(b);
        return temp_corn_2[i];
      }, 0);
      setTotalWheatDaily(temp_corn_2);

      // Wheat daily
      const temp_wheat = structuredClone(dates);
      data.filter(a => a.Commodity === 'Wheat').reduce((acc, it) => {
        const date = new Date(`${it.Departure} 12:00:00 GMT`);
        temp_wheat[date.toISOString().slice(0, 10)] = acc[it.Departure] + parseFloat(it.Tonnage) || 0;
        acc[it.Departure] = acc[it.Departure] + parseFloat(it.Tonnage) || 0;
        return acc;
      }, {});
      const temp_wheat_2 = [];
      Object.values(temp_wheat).reduce((a, b, i) => {
        temp_wheat_2[i] = parseFloat(a) + parseFloat(b);
        return temp_wheat_2[i];
      }, 0);
      setTotalCornDaily(temp_wheat_2);

      // Other daily
      const temp_other = structuredClone(dates);
      data.filter(a => (a.Commodity !== 'Corn' && a.Commodity !== 'Wheat')).reduce((acc, it) => {
        const date = new Date(`${it.Departure} 12:00:00 GMT`);
        temp_other[date.toISOString().slice(0, 10)] = acc[it.Departure] + parseFloat(it.Tonnage) || 0;
        acc[it.Departure] = acc[it.Departure] + parseFloat(it.Tonnage) || 0;
        return acc;
      }, {});
      const temp_other_2 = [];
      Object.values(temp_other).reduce((a, b, i) => {
        temp_other_2[i] = parseFloat(a) + parseFloat(b);
        return temp_other_2[i];
      }, 0);
      setTotalOtherDaily(temp_other_2);
    }
  }, [data, dates]);

  return (
    <div className="app">
      <h1>Black Sea Grain Initiative</h1>
      <div>
        <div className="total_container">
          <h4>Total tonnage departed</h4>
          <h3>{formatNr(totalTonnage)}</h3>
          {totalDaily && (
            <LineChart idx="0" appID={appID} series={totalDaily} />
          )}
          <h4>{`${totalShips} vessels`}</h4>
          <div>{Object.entries(totalDestination).slice(0, 2).map(el => <span>{`${el[0]} ${formatNr(el[1])}` }</span>)}</div>
        </div>

        <div className="commodities_container">
          <div>
            <h4>Corn</h4>
            <h3>{formatNr(totalCornTonnage)}</h3>
            {totalCornDaily && (
              <LineChart idx="1" appID={appID} series={Object.values(totalCornDaily)} />
            )}
            <h4>{`${totalCornShips} vessels`}</h4>
            <div>{Object.entries(totalCornDestination).slice(0, 2).map(el => <span>{`${el[0]} ${formatNr(el[1])}` }</span>)}</div>
          </div>
          <div>
            <h4>Wheat</h4>
            <h3>{formatNr(totalWheatTonnage)}</h3>
            {totalWheatDaily && (
              <LineChart idx="2" appID={appID} series={Object.values(totalWheatDaily)} />
            )}
            <h4>{`${totalWheatShips} vessels`}</h4>
            <div>{Object.entries(totalWheatDestination).slice(0, 2).map(el => <span>{`${el[0]} ${formatNr(el[1])}` }</span>)}</div>
          </div>
          <div>
            <h4>Other</h4>
            <h3>{formatNr(totalOtherTonnage)}</h3>
            {totalOtherDaily && (
              <LineChart idx="3" appID={appID} series={Object.values(totalOtherDaily)} />
            )}
            <h4>{`${totalOtherShips} vessels`}</h4>
            <div>{Object.entries(totalOtherDestination).slice(0, 2).map(el => <span>{`${el[0]} ${formatNr(el[1])}` }</span>)}</div>
          </div>
        </div>
      </div>
      <h2>Browse data</h2>
      <div className="table_container">
        <iframe loading="lazy" title="Outbound vessels" aria-label="Interactive table" src="https://datawrapper.dwcdn.net/z1IW9" scrolling="no" frameBorder="0" height="auto" />
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
