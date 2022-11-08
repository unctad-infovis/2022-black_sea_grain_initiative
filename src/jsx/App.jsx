import React, {
  useState, useEffect, useRef, useCallback
} from 'react';
import '../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// Load helpers.
import slideToggle from './helpers/SlideToggle.js';
import easingFn from './helpers/EasingFn.js';
import getData from './helpers/GetData.js';

import Banner from './components/Banner.jsx';
import TreeMapChart from './components/TreeMapChart.jsx';
import DonutChart from './components/DonutChart.jsx';
import LineBarChart from './components/LineBarChart.jsx';
import Figure3 from './components/Figure3.jsx';
import Figure6 from './components/Figure6.jsx';
import Figure7 from './components/Figure7.jsx';
import Figure9 from './components/Figure9.jsx';
import Figure10 from './components/Figure10.jsx';

const appID = '#app-root-2022-black_sea_grain_initiative';

function App() {
  // Data states.
  const [data, setData] = useState(false);
  const [totalTonnage, setTotalTonnage] = useState(false);
  // const [totalShips, setTotalShips] = useState(0);

  const [commodities, setCommodities] = useState([]);
  const [commodityValue, setCommodityValue] = useState(false);
  const [destinations, setDestinatinons] = useState([]);
  const [destinationValue, setDestinationValue] = useState(false);
  const [destinationStatusValue, setDestinationStatusValue] = useState(false);
  const [duration, setDuration] = useState(0);
  const [features, setFeatures] = useState(false);
  const [destinationDestinationStatus, setDestinationDestinationStatus] = useState(false);
  const [topCommodities, setTopCommodities] = useState([]);
  const [topCommoditiesFull, setTopCommoditiesFull] = useState([]);
  const [topDestinatinons, setTopDestinatinons] = useState([]);
  const [topDestinatinonsFull, setTopDestinatinonsFull] = useState([]);
  const [updated, setUpdated] = useState(false);

  const [totalPerProduct, setTotalPerProduct] = useState(false);
  const [totalPerDestination, setTotalPerDestination] = useState(false);
  const [totalPerDestinationStatus, setTotalPerDestinationStatus] = useState(false);
  const [dates, setDates] = useState({});

  const appRef = useRef();

  // Helper functions.
  const daysBetween = (date_1, date_2) => Math.ceil((date_1.getTime() - date_2.getTime()) / (1000 * 3600 * 24) + 1);
  const dateRange = (start_date, num_of_days) => {
    const start_dateInMs = start_date.getTime() - start_date.getTimezoneOffset('GMT') * 600000;
    return [...Array(num_of_days).keys()].map(i => new Date(start_dateInMs + i * (24 * 60 * 60 * 1000)).toISOString().slice(0, 10));
  };

  const defineData = useCallback(() => {
    const output = [];
    if (commodityValue === false && destinationValue === false && destinationStatusValue === false) {
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
          if (commodityValue !== false && destinationValue !== false) {
            if (commodityValue === 'Other' && destinationValue === 'Other') {
              return !topCommodities.includes(a.Commodity) && !topDestinatinons.includes(a.Destination);
            }
            if (commodityValue === 'Other') {
              return !topCommodities.includes(a.Commodity) && a.Destination === destinationValue;
            }
            if (destinationValue === 'Other') {
              return !topCommodities.includes(a.Destination) && a.Commodity === commodityValue;
            }
            return a.Commodity === commodityValue && a.Destination === destinationValue;
          }
          if (commodityValue !== false && destinationStatusValue !== false) {
            if (commodityValue === 'Other') {
              return !topCommodities.includes(a.Commodity) && a['Development Status'] === destinationStatusValue;
            }
            return a.Commodity === commodityValue && a['Development Status'] === destinationStatusValue;
          }
          if (commodityValue !== false) {
            if (commodityValue === 'Other') {
              return !topCommodities.includes(a.Commodity);
            }
            return a.Commodity === commodityValue;
          }
          if (destinationValue !== false) {
            if (destinationValue === 'Other') {
              return !topDestinatinons.includes(a.Destination);
            }
            return a.Destination === destinationValue;
          }
          if (destinationStatusValue !== false) {
            return a['Development Status'] === destinationStatusValue;
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
  }, [commodityValue, data, dates, destinationStatusValue, destinationValue, topCommodities, topDestinatinons]);

  useEffect(() => {
    getData().then(json_data => {
      json_data.sort((a, b) => new Date(a.Departure) - new Date(b.Departure));
      setData(json_data);
      setCommodities([...new Set(json_data.map(el => el.Commodity))].sort());
      setDestinatinons([...new Set(json_data.map(el => el.Destination))].sort());
      setDates(dateRange(new Date(json_data[0].Departure), daysBetween(new Date(json_data[json_data.length - 1].Departure), new Date(json_data[0].Departure))).reduce((a, v) => ({ ...a, [v]: [v, 0] }), {}));
      setUpdated(new Date(json_data[json_data.length - 1].Departure));
    });
    // eslint-disable-next-line no-unused-expressions,func-names
    !(function () {
      // eslint-disable-next-line no-restricted-syntax,no-void,guard-for-in
      window.addEventListener('message', ((e) => { if (void 0 !== e.data['datawrapper-height']) { const t = appRef.current.querySelectorAll(`${appID} iframe`); for (const a in e.data['datawrapper-height']) for (let r = 0; r < t.length; r++) { if (t[r].contentWindow === e.source)t[r].style.height = `${e.data['datawrapper-height'][a]}px`; } } }));
    }());
  }, []);

  useEffect(() => {
    if (data !== false) {
      setTotalTonnage(data.reduce((acc, it) => acc + parseFloat(it.Tonnage), 0));
      // setTotalShips(new Set(data.map(el => el['Outbound Sequence'])).size);

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

      // Total daily per destination.
      const top_destinations_full = [];
      const top_destinations = [];
      setTotalPerDestination(Object.values(Object.values(data.reduce((acc, it) => {
        acc[it.Destination] = [it.Destination, (acc[it.Destination]?.[1] || 0) + parseFloat(it.Tonnage)];
        return acc;
      }, {})).sort((a, b) => b[1] - a[1]).reduce((acc, it, i) => {
        if (i >= 5) {
          top_destinations_full.push({ name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) });
          acc.Other = { name: 'Other', parent: 'Origin', value: (acc.Other?.value || 0) + parseFloat(it[1]) };
        } else {
          top_destinations.push(it[0]);
          acc[it[0]] = { name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) };
        }
        return acc;
      }, [])));
      setTopDestinatinonsFull(top_destinations_full);
      setTopDestinatinons(top_destinations);

      // Total daily per destination status.
      setTotalPerDestinationStatus(Object.values(Object.values(data.reduce((acc, it) => {
        acc[it['Development Status']] = [it['Development Status'], (acc[it['Development Status']]?.[1] || 0) + parseFloat(it.Tonnage)];
        return acc;
      }, {})).sort((a, b) => b[1] - a[1]).reduce((acc, it) => {
        acc[it[0]] = { name: it[0], parent: 'Origin', value: (acc[0]?.value || 0) + parseFloat(it[1]) };
        return acc;
      }, [])));
    }
  }, [data, dates]);

  const toggleFeatures = () => {
    if (features === false) {
      appRef.current.querySelectorAll('.extra').forEach(el => el.classList.add('enabled'));
      d3.select('path.extra.line').attr('class', 'line extra enabled');
    } else {
      appRef.current.querySelectorAll('.extra').forEach(el => el.classList.remove('enabled'));
      setCommodityValue(false);
      setDestinationValue(false);
    }
    setFeatures(features === false);
  };

  const toggleDestinationDestinationStatus = () => {
    if (destinationDestinationStatus === false) {
      appRef.current.querySelectorAll('.destinations_wrapper, .product_treemap_wrapper').forEach(el => { el.style.height = 'auto'; });
      appRef.current.querySelectorAll('.destinations_wrapper, .product_treemap_wrapper').forEach(el => { el.style.opacity = 1; });
      appRef.current.querySelectorAll('.destinations_wrapper, .product_treemap_wrapper').forEach(el => { el.style.visibility = 'visible'; });
      appRef.current.querySelectorAll('.destination_status_wrapper, .product_donut_wrapper').forEach(el => { el.style.height = 0; });
      appRef.current.querySelectorAll('.destination_status_wrapper, .product_donut_wrapper').forEach(el => { el.style.opacity = 0; });
      appRef.current.querySelectorAll('.destination_status_wrapper, .product_donut_wrapper').forEach(el => { el.style.visibility = 'hidden'; });
      setDestinationStatusValue(false);
    } else {
      appRef.current.querySelectorAll('.destinations_wrapper, .product_treemap_wrapper').forEach(el => { el.style.height = 0; });
      appRef.current.querySelectorAll('.destinations_wrapper, .product_treemap_wrapper').forEach(el => { el.style.opacity = 0; });
      appRef.current.querySelectorAll('.destinations_wrapper, .product_treemap_wrapper').forEach(el => { el.style.visibility = 'hidden'; });
      appRef.current.querySelectorAll('.destination_status_wrapper, .product_donut_wrapper').forEach(el => { el.style.height = 'auto'; });
      appRef.current.querySelectorAll('.destination_status_wrapper, .product_donut_wrapper').forEach(el => { el.style.opacity = 1; });
      appRef.current.querySelectorAll('.destination_status_wrapper, .product_donut_wrapper').forEach(el => { el.style.visibility = 'visible'; });
      setDestinationValue(false);
    }
    setDestinationDestinationStatus((destinationDestinationStatus === false));
  };

  return (
    <div className="app" ref={appRef}>
      <div className="heading_container">
        <h2>
          {'Black Sea Grain Initiative '}
          <span className="highlight">in numbers</span>
        </h2>
      </div>
      { /* Banner container */ }
      {(data && totalTonnage && updated) && <Banner appID={appID} defineData={defineData} standAlone={false} totalTonnage={totalTonnage} updated={updated} />}
      { /* Visualisations container */ }
      <div className="visualisations_container">
        <div className="vis_row">
          <Figure3 />
        </div>
        <div className="vis_row">
          <Figure7 />
        </div>
        <div className="vis_row">
          <Figure9 />
        </div>
        <div className="vis_row">
          <Figure10 />
        </div>
        <div className="vis_row">
          <Figure6 />
        </div>
        <div className="vis_row vis_row_1">
          <div className="toggle_features_container"><button type="button" onClick={(event) => toggleFeatures(event)}>{(features === false) ? 'Play with the data' : 'Hide features'}</button></div>
          <h3>
            <span className="highlight">How much</span>
            {' '}
            has been shipped daily?
          </h3>
          {(data) && (<LineBarChart appID={appID} commodities={commodities} commodityValue={commodityValue} destinations={destinations} destinationValue={destinationValue} destinationStatusValue={destinationStatusValue} features={features} defineData={defineData} duration={duration} easingFn={easingFn} idx="1" setCommodityValue={setCommodityValue} setDestinationValue={setDestinationValue} setDuration={setDuration} />)}
        </div>
        <div className="vis_row vis_row_2">
          <div className="column column_1">
            <h4>
              <span className="highlight">What</span>
              {' are the main products carried?'}
            </h4>
            <div className="instruction extra">Choose a commodity of interest</div>
            <div className="product_donut_wrapper">
              {totalPerProduct && (<DonutChart category="Commodity" commodityValue={commodityValue} destinationValue={destinationValue} destinationStatusValue={destinationStatusValue} idx="5" series={totalPerProduct} setCommodityValue={setCommodityValue} setDestinationValue={setDestinationValue} setDestinationStatusValue={setDestinationStatusValue} setDuration={setDuration} />)}
            </div>
            <div className="product_treemap_wrapper" style={{ height: 0, opacity: 0, visibility: 'hidden' }}>
              {totalPerProduct && (<TreeMapChart category="Commodity" commodityValue={commodityValue} destinationValue={destinationValue} idx="2" series={totalPerProduct} setCommodityValue={setCommodityValue} setDestinationValue={setDestinationValue} setDuration={setDuration} />)}
            </div>
            <div className="list_container_toggle"><button onClick={() => slideToggle(appRef.current.querySelectorAll('.list_container_commodity')[0])} type="button">Show other products</button></div>
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
              {' has the cargo gone to?'}
            </h4>
            <div className="toggle_features_container"><button type="button" onClick={(event) => toggleDestinationDestinationStatus(event)}>{(destinationDestinationStatus === false) ? 'See per destination' : 'Return'}</button></div>
            <div className="destination_status_wrapper">
              <div className="instruction extra">Choose a destination of interest</div>
              {totalPerDestinationStatus && (<DonutChart category="DestinationStatus" commodityValue={commodityValue} destinationValue={destinationValue} destinationStatusValue={destinationStatusValue} idx="5" series={totalPerDestinationStatus} setCommodityValue={setCommodityValue} setDestinationValue={setDestinationValue} setDestinationStatusValue={setDestinationStatusValue} setDuration={setDuration} />)}
            </div>
            <div className="destinations_wrapper" style={{ height: 0, opacity: 0, visibility: 'hidden' }}>
              <div className="instruction extra">Choose a destination of interest</div>
              {totalPerDestination && (<TreeMapChart category="Destination" commodityValue={commodityValue} destinationValue={destinationValue} idx="3" series={totalPerDestination} setCommodityValue={setCommodityValue} setDestinationValue={setDestinationValue} setDuration={setDuration} />)}
              <div className="list_container_toggle"><button onClick={() => slideToggle(appRef.current.querySelectorAll('.list_container_destination')[0])} type="button">Show other destinations</button></div>
              <div className="list_container list_container_destination">
                <table>
                  <thead>
                    <tr>
                      <th>Destination</th>
                      <th>Metric tons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDestinatinonsFull && topDestinatinonsFull.map(el => (
                      <tr key={el.name} className={(el.name === destinationValue) ? 'selected' : ''}>
                        <td><button onClick={() => { setDestinationValue((el.name === destinationValue) ? false : el.name); setDuration(1000); }} type="button">{el.name}</button></td>
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
        <iframe title="Vessel movements - Outbound voyages" aria-label="Table" id="datawrapper-chart-MUWoW" src="https://datawrapper.dwcdn.net/MUWoW/2/" scrolling="no" frameBorder="0" style={{ width: 0, minWidth: '100% !important', border: 'none' }} height="931" />
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
