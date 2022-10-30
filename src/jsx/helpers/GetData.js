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
    el.Destination = el.Country;
    el.Departure = el['Departure date'];
    return el;
  }));

export default getData;
