// Load helpers.
import CSVtoJSON from './CSVtoJSON.js';

const getData = () => fetch((window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2022-black_sea_grain_initiative/assets/data/2022-black_sea_grain_initiative_table.csv' : './assets/data/2022-black_sea_grain_initiative_table.csv', { method: 'GET' })
  .then((response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.text();
  })
  .then(body => CSVtoJSON(body).map(el => {
    const regextractDestination = (/:(..):/).exec(el.Destination)[1];
    el.country_code = regextractDestination;
    el.Destination = el.Destination.replace(/(:..:)/g, '');
    return el;
  }));

export default getData;
