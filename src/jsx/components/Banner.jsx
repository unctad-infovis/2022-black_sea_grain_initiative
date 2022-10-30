import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';

import LineChart from './LineChart.jsx';

// Load helpers.
import easingFn from '../helpers/EasingFn.js';
import getData from '../helpers/GetData.js';

function Banner({
  appID, defineData, standAlone, totalTonnage, updated
}) {
  const [totalTonnageLocal, setTotalTonnageLocal] = useState(0);
  const [updatedLocal, setUpdatedLocal] = useState(new Date());
  const [once, setOnce] = useState(false);

  useEffect(() => {
    if (document.querySelector('.page-header span') !== null) {
      document.querySelector('.page-header span').innerHTML = 'Black Sea Grain Initiative <span class="highlight">in numbers</span>';
    }
    setOnce(true);
  }, []);
  useEffect(() => {
    if (standAlone === true) {
      getData().then(json_data => {
        setTotalTonnageLocal((json_data.reduce((acc, it) => acc + parseFloat(it.Tonnage), 0)));
        setUpdatedLocal(new Date(json_data[json_data.length - 1].Departure));
      });
    } else {
      setTotalTonnageLocal(totalTonnage);
      setUpdatedLocal(updated);
    }
  }, [standAlone, totalTonnage, updated]);
  return (
    <div className="header_container_outer">
      <div className="header_container">
        <div className="heading_content">
          <h3><CountUp easingFn={easingFn} end={totalTonnageLocal} duration={4} separator="," useEasing /></h3>
          {once && <LineChart appID={appID} series={defineData()} />}
          <h4>Total tonnes carried</h4>
          <div className="updated_container"><h5>{(updatedLocal) && `As of ${updatedLocal.getDate()}  ${updatedLocal.toLocaleString('default', { month: 'long' })} ${updatedLocal.getFullYear()} ` }</h5></div>
        </div>
      </div>
    </div>
  );
}

Banner.propTypes = {
  appID: PropTypes.string.isRequired,
  defineData: PropTypes.instanceOf(Function).isRequired,
  standAlone: PropTypes.bool,
  totalTonnage: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  updated: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.bool])
};

Banner.defaultProps = {
  standAlone: true,
  totalTonnage: false,
  updated: false
};

export default Banner;
