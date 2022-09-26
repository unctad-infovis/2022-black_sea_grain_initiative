import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import PropTypes from 'prop-types';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';

// @See https://bl.ocks.org/htakeuchi/a60c0ecb55713c06c054c26c6dbed57a

// https://d3js.org/
import * as d3 from 'd3';

function LineBarChart({
  // eslint-disable-next-line
  appID, commodities, countries, commodityValue, countryValue, defineData, duration, idx, setCommodityValue, setCountryValue, setDuration
}) {
  const chartRef = useRef(null);
  const [g, setG] = useState(false);
  const [total, setTotal] = useState(0);
  const prevCountRef = useRef();

  useEffect(() => {
    prevCountRef.current = total;
  }, [total]);

  const [axisStatic, setAxisStatic] = useState(true);
  const maxAxisLeft = useRef();
  const maxAxisRight = useRef();

  const margin = useMemo(() => ({
    top: 40, right: 50, bottom: 30, left: 40
  }), []);
  const height = 300 - margin.top - margin.bottom;

  const x = d3.scaleBand();
  const createChart = useCallback((svg) => {
    const width = chartRef.current.offsetWidth - margin.left - margin.right;
    svg.attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    svg.selectAll('.axis_y_right').attr('transform', `translate(${width}, 0)`);
  }, [margin, height]);

  const xAxis = d3.axisBottom().scale(x).tickSizeOuter([0]).tickValues(['2022-08-01', '2022-08-10', '2022-08-20', '2022-09-01', '2022-09-10', '2022-09-20']);

  const yLeft = d3.scaleLinear().range([height, 0]);
  const yAxisLeft = d3.axisLeft().scale(yLeft).tickSizeOuter([0]).ticks(5)
    .tickFormat(val => ((val !== 0 && val > 1000) ? `${(val / 1000).toLocaleString()}k` : ''));
  const yRight = d3.scaleLinear().range([height, 0]);
  const yAxisRight = d3.axisRight().scale(yRight).tickSizeOuter([0]).ticks(5)
    .tickFormat(val => ((val !== 0 && val > 1000) ? `${(val / 1000).toLocaleString()}k` : ''));
  // eslint-disable-next-line
  const updateData = useCallback((selected_series, update) => {
    setTotal(selected_series[selected_series.length - 1][2]);
    if (g && (duration > 0 || (update === true))) {
      x.domain(selected_series.map((d) => d[0]));
      x.rangeRound([0, chartRef.current.offsetWidth - margin.left - margin.right]).padding(0.1);
      g.selectAll('.axis_x')
        .call(xAxis);

      if (maxAxisLeft.current === undefined) {
        maxAxisLeft.current = [0, d3.max(selected_series, ((d) => d[1]))];
        maxAxisRight.current = [0, d3.max(selected_series, ((d) => d[2]))];
      }
      if (axisStatic !== false) {
        yLeft.domain([0, Math.max(d3.max(selected_series, ((d) => d[1])), 1)]);
        yRight.domain([0, Math.max(d3.max(selected_series, ((d) => d[2])), 1)]);
      } else {
        yLeft.domain(maxAxisLeft.current);
        yRight.domain(maxAxisRight.current);
      }

      // Axis-y-left
      g.selectAll('.axis_y_left')
        .transition()
        .duration(duration)
        .call(yAxisLeft);

      // Axis-y-right
      g.selectAll('.axis_y_right')
        .transition()
        .duration(duration)
        .call(yAxisRight);

      // Bars
      // @See https://d3-graph-gallery.com/graph/barplot_button_data_simple.html
      const bars = g.selectAll('.bar')
        .data(selected_series);
      bars.join('rect')
        .on('mouseover', (event, d) => {
          document.querySelectorAll(`${appID} .bar_value_${d[3]}`).forEach(el => el.classList.add('visible'));
        })
        .on('mouseleave', () => {
          document.querySelectorAll(`${appID} .bar_value`).forEach(el => el.classList.remove('visible'));
        })
        .transition()
        .duration(duration)
        .attr('class', 'bar')
        .attr('x', (d) => x(d[0]))
        .attr('y', (d) => yLeft(d[1]))
        .attr('width', x.bandwidth())
        .attr('height', (d) => height - yLeft(d[1]))
        .attr('fill', '#009edb');

      // Line
      // @See https://d3-graph-gallery.com/graph/line_change_data.html
      const line = g.selectAll('.line')
        .data([selected_series]);
      line.join('path')
        .transition()
        .duration(duration)
        .attr('d', d3.line()
          .x((d) => x(d[0]) + x.bandwidth() / 2)
          .y((d) => yRight(d[2]))
          .curve(d3.curveMonotoneX))
        .attr('class', 'line');

      // Line dots
      const dots = g.selectAll('circle')
        .data(selected_series);
      dots.join('circle')
        .on('mouseover', (event, d) => {
          document.querySelectorAll(`${appID} .line_value_${d[3]}`).forEach(el => el.classList.add('visible'));
        })
        .on('mouseleave', () => {
          document.querySelectorAll(`${appID} .line_value`).forEach(el => el.classList.remove('visible'));
        })
        .transition()
        .duration(duration)
        .attr('class', 'dot')
        .attr('cx', (d) => x(d[0]) + x.bandwidth() / 2)
        .attr('cy', (d) => yRight(d[2]))
        .attr('r', 4);

      // Line values
      const line_values = g.selectAll('.line_value')
        .data(selected_series);
      line_values.join('text')
        .transition()
        .duration(duration)
        .attr('dy', '-1em')
        .attr('x', (d) => x(d[0]) + x.bandwidth() / 2)
        .attr('y', (d) => yRight(d[2]))
        .attr('class', (d, i) => `line_value line_value_${i}`)
        .text((d) => d[2].toLocaleString());

      // Bar values
      const bar_values = g.selectAll('.bar_value')
        .data(selected_series);
      bar_values.join('text')
        .transition()
        .duration(duration)
        .attr('dy', '-0.5em')
        .attr('x', (d) => x(d[0]) + x.bandwidth() / 2)
        .attr('y', (d) => yLeft(d[1]))
        .attr('class', (d, i) => `bar_value bar_value_${i}`)
        .text((d) => d[1].toLocaleString());
    }
  }, [appID, axisStatic, duration, g, height, margin, x, xAxis, yAxisLeft, yAxisRight, yLeft, yRight]);

  useEffect(() => {
    const svg = d3.select(chartRef.current).append('svg');
    const container_g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    container_g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'axis_x');
    container_g.append('g')
      .attr('class', 'axis_y axis_y_left');
    container_g.append('g')
      .attr('class', 'axis_y axis_y_right');
    setG(container_g);
    createChart(svg);
  }, [createChart, margin, height]);

  useEffect(() => {
    if (g) {
      updateData(defineData(), true);
      setDuration(1000);
    }
  }, [commodityValue, countryValue, defineData, duration, g, setDuration, updateData]);

  window.addEventListener('resize', () => {
    createChart(d3.select(chartRef.current).selectAll('svg'));
    updateData(defineData());
  });

  const selectionChange = (event, type) => {
    if (type === 'Commodity') {
      setCommodityValue((event.target.value === 'false') ? false : event.target.value);
    } else if (type === 'Country') {
      setCountryValue((event.target.value === 'false') ? false : event.target.value);
    }
    updateData(defineData());
  };
  // eslint-disable-next-line
  const easingFn = (t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b;

  return (
    <div>
      <div className="legend_container">
        <div className="left">
          <div className="bar_legend_container">
            <span className="legend_icon" />
            <span className="legend_text">Per day</span>
          </div>
          <div className="line_legend_container">
            <span className="legend_icon" />
            <span className="legend_text">
              In total
              {' '}
              {total && <CountUp separator="," end={total} duration={(prevCountRef.current === 0) ? 0 : 1} start={prevCountRef.current} useEasing easingFn={easingFn} />}
            </span>
          </div>
          <div className="selected">
            {commodityValue && (
            <div>
              <span className="type_legend">Commodity</span>
              <span className="value_legend">{commodityValue}</span>
            </div>
            )}
            {countryValue && (
            <div>
              <span className="type_legend">Destination</span>
              <span className="value_legend">{countryValue}</span>
            </div>
            )}
          </div>
        </div>
        <div className="right">
          <label htmlFor={`${appID}Checkbox`}>
            <input type="checkbox" onClick={() => ((axisStatic === true) ? setAxisStatic(false) : setAxisStatic(true))} id={`${appID}Checkbox`} />
            <span className="axis_toggle_label">Keep axis</span>
          </label>
        </div>
      </div>
      <div className={`dashboard_chart chart_${idx}`} ref={chartRef} />
      <div className="selection_container">
        <div className="instruction">Choose a commodity or destination of interest</div>
        <span className="selection_commodity">
          <span className="selection_label">Commodity</span>
          <select onChange={(event) => selectionChange(event, 'Commodity')} value={commodityValue}>
            <option value={false}>Select commodity</option>
            <option disabled>– – – </option>
            {
              commodities && commodities.map(el => (
                <option key={el} value={el}>{el}</option>
              ))
            }
            <option disabled>– – – </option>
            <option value="Other">Other than top three</option>
          </select>
          <button type="button" className={`remove ${commodityValue && 'enabled'}`} value={false} onClick={(event) => selectionChange(event, 'Commodity')}>⨯</button>
        </span>
        <span className="selection_destination">
          <span className="selection_label">Destination</span>
          <select onChange={(event) => selectionChange(event, 'Country')} value={countryValue}>
            <option value={false}>Select destination</option>
            <option disabled>– – – </option>
            {
              countries && countries.map(el => (
                <option key={el} value={el}>{el}</option>
              ))
            }
            <option disabled>– – – </option>
            <option value="Other">Other than top six</option>
          </select>
          <button type="button" className={`remove ${countryValue && 'enabled'}`} value={false} onClick={(event) => selectionChange(event, 'Country')}>⨯</button>
        </span>
      </div>
    </div>
  );
}

LineBarChart.propTypes = {
  appID: PropTypes.string.isRequired,
  commodities: PropTypes.instanceOf(Array).isRequired,
  commodityValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  countries: PropTypes.instanceOf(Array).isRequired,
  countryValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  defineData: PropTypes.instanceOf(Function).isRequired,
  duration: PropTypes.number.isRequired,
  idx: PropTypes.string.isRequired,
  setCommodityValue: PropTypes.instanceOf(Function).isRequired,
  setCountryValue: PropTypes.instanceOf(Function).isRequired,
  setDuration: PropTypes.instanceOf(Function).isRequired
};

LineBarChart.defaultProps = {
};

export default LineBarChart;
