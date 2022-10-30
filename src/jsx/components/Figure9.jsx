import React, { useState, useEffect } from 'react';

import { transpose } from 'csv-transpose';

// Load helpers.
import CSVtoJSON from '../helpers/CSVtoJSON.js';
import ChartLine from '../charts/ChartLine.jsx';

function Figure9() {
  // Data states.
  const [dataFigure, setDataFigure] = useState(false);

  const cleanData = (data) => (data.map(el => ({
    data: Object.values(el).map(val => parseFloat(val)).filter((val, j) => !Number.isNaN(val) && j !== 0),
    labels: Object.keys(el).filter(val => val !== 'date').map(val => (`${new Date(val).toLocaleString([], { month: 'short' })} ${(new Date(val)).getFullYear()}`)),
    name: 'Food price Index',
    zIndex: 2
  })));

  useEffect(() => {
    const data_file = `${(window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2022-ukraine_brief_3_dashboard/' : './'}assets/data/fao_food_price_index.csv`;
    try {
      fetch(data_file)
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.text();
        })
        .then(body => setDataFigure(cleanData(CSVtoJSON(transpose(body, ',')))));
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div>
      {dataFigure && (
      <ChartLine
        allow_decimals={false}
        data={dataFigure}
        data_decimals={0}
        export_title_margin={50}
        idx="9"
        labels={false}
        show_first_label
        source="FAO"
        show_only_first_and_last_labels
        subtitle="FAO Food Price Index (100=January 2020)"
        tick_interval={3}
        tick_interval_y={10}
        title="The Initiative has helped to push down food prices in the last six months"
        x_labels_month_year
        xlabel=""
      />
      )}
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default Figure9;
