import React, { useState, useEffect } from 'react';

// Load helpers.
import CSVtoJSON from '../helpers/CSVtoJSON.js';
import ChartLine from '../charts/ChartLine.jsx';

function Figure3() {
  // Data states.
  const [dataFigure, setDataFigure] = useState(false);

  const cleanData = (data) => (data.map((el, i) => ((i === 2)
    ? {
      data: Object.values(el).map(val => (val.split(' ').map(val1 => parseFloat(val1) / 1000000))).filter((val, j) => !Number.isNaN(val) && j !== 0 && (j !== Object.values(el).filter(val1 => val1 !== '').length)),
      labels: Object.keys(el).filter(val => val !== 'Name'),
      name: el.Name,
      color: '#eee',
      type: 'arearange',
      showInLegend: false,
      marker: {
        enabled: false
      },
      zIndex: 1
    }
    : {
      data: Object.values(el).map(val => parseFloat(val) / 1000000).filter((val, j) => !Number.isNaN(val) && j !== 0 && !(el.Name === 'Grain cargos in 2022 (under the Black Sea Grain Initiative)' && j === Object.values(el).filter(val1 => val1 !== '').length - 1)),
      labels: Object.keys(el).filter(val => val !== 'Name'),
      name: el.Name,
      zIndex: 2
    })));

  useEffect(() => {
    const data_file = `${(window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2022-black_sea_grain_initiative/' : './'}assets/data/2022-black_sea_grain_initiative_figure_3.csv`;
    try {
      fetch(data_file)
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.text();
        })
        .then(body => setDataFigure(cleanData(CSVtoJSON(body))));
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
        data_decimals={1}
        export_title_margin={30}
        idx="3"
        labels={false}
        show_first_label={false}
        source="UNCTAD secretariat, based on data provided by Sea/ (www.sea.live) and the Joint Coordination Centre."
        subtitle="Weekly volume of grain shipped from Ukranian ports, 2021 vs 2022 (millions of tonnes)"
        suffix="M"
        tick_interval={2}
        tick_interval_y={0.5}
        title="The gap in weekly grain cargo is closing. But there is still work to do"
        xlabel="Week"
      />
      )}
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default Figure3;
