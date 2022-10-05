// Load helpers.
import CSVtoJSON from './CSVtoJSON.js';

const getData = () => fetch((window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2022-black_sea_grain_initiative/assets/data/table.csv' : 'https://storage.unctad.org/2022-black_sea_grain_initiative/assets/data/table.csv', { method: 'GET' })
  .then((response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.text();
  })
  .then(body => CSVtoJSON(body));

export default getData;
