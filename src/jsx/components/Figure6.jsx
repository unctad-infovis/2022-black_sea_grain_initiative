import React, { useState, useEffect } from 'react';

// Load helpers.
import CSVtoJSON from '../helpers/CSVtoJSON.js';
import ChartColumn from '../charts/ChartColumn.jsx';

function Figure6() {
  // Data states.
  const [dataFigure, setDataFigure] = useState(false);

  const cleanData = (data) => data.map(el => ({
    data: Object.values(el).map(val => parseFloat(val) * 100).filter(val => !Number.isNaN(val)),
    labels: Object.keys(el).filter(val => val !== 'Name'),
    name: el.Name
  }));

  useEffect(() => {
    const data_file = `${(window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2022-black_sea_grain_initiative/' : './'}assets/data/2022-black_sea_grain_initiative_figure_6.csv`;
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
      <ChartColumn
        data={dataFigure}
        data_decimals={1}
        export_title_margin={40}
        idx="6"
        note="Annual procurement requirements are based on data from 2021; fertilizer sourcing progress is measured for selected countries for which data were available as of 14 May 2022. This graphic shows how the relative share of annual procurement varies across the calendar year. It does not however show the absolute differences among regions in quantities imported of fertilizer."
        source="UN Global Crisis Response Group calculations, based on data from FAO, the International Fertilizer Association, the International Fertilizer Development Centre, the International Food Policy Research Institute and the World Business Council for Sustainable Development."
        subtitle="Monthly percentage of annual procurement of fertilizer in selected areas"
        title="East African countries are in urgent need of fertilizer"
        xlabelrotation={0}
        suffix="%"
        ymax={25}
        ymin={0}
      />
      )}
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default Figure6;
