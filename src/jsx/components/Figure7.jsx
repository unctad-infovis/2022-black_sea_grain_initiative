import React, { useState, useEffect } from 'react';

// Load helpers.
import CSVtoJSON from '../helpers/CSVtoJSON.js';
import ChartDonut from '../charts/ChartDonut.jsx';

function Figure7() {
  // Data states.
  const [dataFigure, setDataFigure] = useState(false);

  const cleanData = (data) => ([{
    data: (data).map(el => ({
      y: parseInt(Object.values(el)[1], 10),
      name: el.Name,
      sliced: (el.Name === 'Developed'),
      selected: true,
      dataLabels: {
        distance: (el.Name === 'Developed') ? -55 : (el.Name === 'Other Developing') ? 0 : -1,
        x: (el.Name === 'Developed') ? 30 : (el.Name === 'Other Developing') ? -60 : 110,
        y: (el.Name === 'Developed') ? -5 : (el.Name === 'Other Developing') ? -2 : 30
      }
    })),
    name: 'Wheat'
  }]);

  useEffect(() => {
    const data_file = `${(window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2022-black_sea_grain_initiative/' : './'}assets/data/2022-black_sea_grain_initiative_figure_7.csv`;
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
      <ChartDonut
        allow_decimals={false}
        data={dataFigure}
        data_decimals={0}
        export_title_margin={30}
        idx="7"
        labels
        note="Note: Cargo may be processed and re-exported from the primary destination."
        source="UNCTAD Secretariat based on data from the Joint Coordination Centre"
        subtitle="Share of exports of wheat to country groups by development status"
        tick_interval={2}
        title="Wheat is a pillar of food security, and it is mostly going to developing countries"
        xlabel="Week"
      />
      )}
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default Figure7;
