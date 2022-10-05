import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';

// Load helpers.
import easingFn from './helpers/EasingFn.js';
import getData from './helpers/GetData.js';

function Banner({
  standAlone, totalShips, totalTonnage, updated
}) {
  const [totalTonnageLocal, setTotalTonnageLocal] = useState(0);
  const [totalShipsLocal, setTotalShipsLocal] = useState(0);
  const [updatedLocal, setUpdatedLocal] = useState(new Date());

  useEffect(() => {
    if (standAlone === true) {
      getData().then(json_data => {
        setTotalTonnageLocal((json_data.reduce((acc, it) => acc + parseFloat(it.Tonnage), 0)));
        setTotalShipsLocal((new Set(json_data.map(el => el['IMO-Vessel name'])).size));
        setUpdatedLocal(new Date(json_data[json_data.length - 1].Departure));
      });
    } else {
      setTotalTonnageLocal(totalTonnage);
      setTotalShipsLocal(totalShips);
      setUpdatedLocal(updated);
    }
  }, [standAlone, totalShips, totalTonnage, updated]);
  return (
    <>
      <h2>
        {'Black Sea Grain Initiative '}
        <span className="highlight">in numbers</span>
      </h2>
      <div className="header_container_outer">
        <div className="header_container">
          <h3><CountUp easingFn={easingFn} end={totalTonnageLocal} duration={4} separator="," useEasing /></h3>
          <h4>Total tonnes carried</h4>
          <h3><CountUp easingFn={easingFn} end={totalShipsLocal} duration={4} separator="," useEasing /></h3>
          <h4>Vessels departed</h4>
          <div className="updated_container"><h5>{(updatedLocal) && `As of ${updatedLocal.getDate()}  ${updatedLocal.toLocaleString('default', { month: 'long' })} ${updatedLocal.getFullYear()} ` }</h5></div>
        </div>
      </div>
    </>
  );
}

Banner.propTypes = {
  standAlone: PropTypes.bool,
  totalShips: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  totalTonnage: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  updated: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.bool])
};

Banner.defaultProps = {
  standAlone: true,
  totalShips: false,
  totalTonnage: false,
  updated: false
};

export default Banner;
