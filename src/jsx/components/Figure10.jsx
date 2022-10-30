import React, { useState, useEffect } from 'react';

import { transpose } from 'csv-transpose';

// Load helpers.
import CSVtoJSON from '../helpers/CSVtoJSON.js';
import ChartLine from '../charts/ChartLine.jsx';

function Figure10() {
  // Data states.
  const [dataFigure, setDataFigure] = useState(false);

  const cleanData = (data) => (data.map(el => ({
    data: Object.values(el).map(val => parseFloat(val)).filter((val, j) => !Number.isNaN(val) && j !== 0),
    labels: Object.keys(el).map(val => val.split('M')[0]).filter(val => val !== 'date'),
    name: el.date,
    zIndex: 2
  })));

  useEffect(() => {
    const data_file = `${(window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2022-ukraine_brief_3_dashboard/' : './'}assets/data/2022-black_sea_grain_initiative_figure_10.csv`;
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
        idx="10"
        labels={false}
        show_first_label
        source="Source: UNCTAD secretariat based on World Bank Commodity Price Data (The Pink Sheet)"
        show_only_first_and_last_labels
        subtitle="In nominal US dollars"
        tick_interval={12}
        tick_interval_y={50}
        ymin={0}
        title="However, uncertainty about the renewal of the Initiative is sending prices of grain up again"
        x_labels_year
        xlabel=""
      />
      )}
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default Figure10;
