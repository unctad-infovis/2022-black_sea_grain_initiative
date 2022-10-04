// Load helpers.
import CSVtoJSON from './CSVtoJSON.js';

const getData = () => fetch((window.location.href.includes('unctad.org')) ? '/sites/default/files/data-file/2022-black_sea_grain_initiative.csv' : './assets/data/data - data.csv', { method: 'GET' })
  .then((response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.text();
  })
  .then(body => CSVtoJSON(body));

export default getData;
