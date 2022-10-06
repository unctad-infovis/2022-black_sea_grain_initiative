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
      <div className="heading_container">
        <h2>
          {'Black Sea Grain Initiative '}
          <span className="highlight">in numbers</span>
        </h2>
        <h4>On 22 July, the United Nations, the Russian Federation, Türkiye and Ukraine agreed the Black Sea Grain Initiative, at a signing ceremony in Istanbul.</h4>
        <h4>The initiative was set up to resume Ukranian grain exports via the Black Sea amid the ongoing war. The UN plan, which also paves the way for Russian food and fertilizer to reach global markets, is helping to stabilize spiralling food prices worldwide and prevent a food crisis that could affect millions of people around the globe.</h4>
        <h4>This dashboard presents up-to-date statistics on what has been shipped under the initiative, how much has reached world markets, and how global prices of food and fertilizers have evolved.</h4>
      </div>
      <div className="header_container_outer">
        <div className="header_container">
          <div className="heading_content">
            <h3><CountUp easingFn={easingFn} end={totalTonnageLocal} duration={4} separator="," useEasing /></h3>
            <h4>Total tonnes carried</h4>
            <h3><CountUp easingFn={easingFn} end={totalShipsLocal} duration={4} separator="," useEasing /></h3>
            <h4>Vessels departed</h4>
            <div className="updated_container"><h5>{(updatedLocal) && `As of ${updatedLocal.getDate()}  ${updatedLocal.toLocaleString('default', { month: 'long' })} ${updatedLocal.getFullYear()} ` }</h5></div>
          </div>
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
