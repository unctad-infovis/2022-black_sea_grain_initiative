import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import PropTypes from 'prop-types';

// @See https://bl.ocks.org/htakeuchi/a60c0ecb55713c06c054c26c6dbed57a

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';
// https://d3js.org/
import * as d3 from 'd3';

// Load helpers.
import debounce from '../helpers/Debounce.js';

function LineBarChart({
  // eslint-disable-next-line
  appID, commodities, commodityValue, destinations, destinationValue, destinationStatusValue, easingFn, features, defineData, duration, idx, setCommodityValue, setDestinationValue, setDuration
}) {
  const [axisStatic, setAxisStatic] = useState(false);
  const [chartRefWidth, setChartRefWidth] = useState(0);
  const [g, setG] = useState(false);
  const [total, setTotal] = useState(0);

  const chartRef = useRef(null);
  const maxAxisLeft = useRef();
  const maxAxisRight = useRef();
  const prevCountRef = useRef();
  const prevWidth = useRef();

  const margin = useMemo(() => ({
    bottom: 30, left: 40, right: 50, top: 40
  }), []);
  const height = 300 - margin.top - margin.bottom;

  const x = d3.scaleBand();
  const createChart = useCallback((svg) => {
    const width = chartRef.current.offsetWidth - margin.left - margin.right;
    svg.attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right);
    svg.selectAll('.axis_y_right')
      .attr('transform', `translate(${width}, 0)`);
  }, [margin, height]);

  const xAxis = d3.axisBottom().scale(x).tickSizeOuter([0]).tickValues(['2022-08-01', '2022-08-15', '2022-09-01', '2022-09-15', '2022-10-01', '2022-10-15'])
    .tickFormat(d => {
      const date = new Date(`${d} 12:00:00 GMT`);
      return (`${date.toLocaleString('default', { day: 'numeric' })} ${date.toLocaleString('default', { month: 'short' }).slice(0, 3)}`);
    });

  const yLeft = d3.scaleLinear()
    .range([height, 0]);
  const yAxisLeft = d3.axisLeft()
    .scale(yLeft)
    .tickSizeOuter([0])
    .ticks(5)
    .tickFormat(val => ((val !== 0 && val > 1000) ? `${(val / 1000).toLocaleString()}k` : ''));
  const yRight = d3.scaleLinear()
    .range([height, 0]);
  const yAxisRight = d3.axisRight()
    .scale(yRight)
    .tickSizeOuter([0])
    .ticks(5)
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
        .on('mouseover', (event, d) => document.querySelectorAll(`${appID} .bar_value_${d[3]}`).forEach(el => el.classList.add('visible')))
        .on('mouseleave', () => document.querySelectorAll(`${appID} .bar_value`).forEach(el => el.classList.remove('visible')))
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
        .attr('class', () => ((features === true) ? 'line extra enabled' : 'line extra'));

      // Line dots
      const dots = g.selectAll('circle')
        .data(selected_series);
      dots.join('circle')
        .on('mouseover', (event, d) => document.querySelectorAll(`${appID} .line_value_${d[3]}`).forEach(el => el.classList.add('visible')))
        .on('mouseleave', () => document.querySelectorAll(`${appID} .line_value`).forEach(el => el.classList.remove('visible')))
        .transition()
        .duration(duration)
        .attr('class', () => ((features === true) ? 'dot extra enabled' : 'dot extra'))
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
  }, [appID, axisStatic, features, duration, g, height, margin, x, xAxis, yAxisLeft, yAxisRight, yLeft, yRight]);

  useEffect(() => {
    const svg = d3.select(chartRef.current)
      .append('svg');
    const container_g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    container_g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'axis_x');
    container_g.append('g')
      .attr('class', 'axis_y axis_y_left');
    container_g.append('g')
      .attr('class', 'axis_y axis_y_right extra');
    setG(container_g);
    createChart(svg);
  }, [createChart, height, margin]);

  useEffect(() => {
    if (g) {
      updateData(defineData(), true);
      setDuration(1000);
    }
  }, [commodityValue, destinationValue, destinationStatusValue, defineData, duration, g, setDuration, updateData]);

  useEffect(() => {
    prevCountRef.current = total;
  }, [total]);

  useEffect(() => {
    prevWidth.current = chartRef.current.offsetWidth;
  }, [chartRefWidth]);

  useEffect(() => {
    setChartRefWidth(chartRef.current.offsetWidth);
  }, []);

  // Function with stuff to execute
  const resizeContent = () => {
    if (prevWidth.current !== chartRef.current.offsetWidth) {
      setChartRefWidth(chartRef.current.offsetWidth);
      createChart(d3.select(chartRef.current).selectAll('svg'));
      updateData(defineData());
    }
  };

  window.addEventListener('resize', debounce(resizeContent, 150));

  const selectionChange = (event, type) => {
    if (type === 'Commodity') {
      setCommodityValue((event.target.value === 'false') ? false : event.target.value);
    } else if (type === 'Destination') {
      setDestinationValue((event.target.value === 'false') ? false : event.target.value);
    }
    updateData(defineData());
  };

  return (
    <>
      <div className="legend_container extra">
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
            {destinationValue && (
            <div>
              <span className="type_legend">Destination</span>
              <span className="value_legend">{destinationValue}</span>
            </div>
            )}
          </div>
        </div>
        <div className="right">
          <label htmlFor={`${appID}Checkbox`}>
            <input type="checkbox" checked onChange={() => ((axisStatic === true) ? setAxisStatic(false) : setAxisStatic(true))} id={`${appID}Checkbox`} />
            <span className="axis_toggle_label">Keep axis</span>
          </label>
        </div>
      </div>
      <div className={`dashboard_chart chart_${idx}`} ref={chartRef} />
      <div className="selection_container extra">
        <div className="instruction">Choose a commodity or destination of interest</div>
        <span className="selection_commodity">
          <span className="selection_label">Commodity</span>
          <select onChange={(event) => selectionChange(event, 'Commodity')} value={commodityValue}>
            <option value={false}>All commodities</option>
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
          <select onChange={(event) => selectionChange(event, 'Destination')} value={destinationValue}>
            <option value={false}>All destinations</option>
            <option disabled>– – – </option>
            {
              destinations && destinations.map(el => (
                <option key={el} value={el}>{el}</option>
              ))
            }
            <option disabled>– – – </option>
            <option value="Other">Other than top six</option>
          </select>
          <button type="button" className={`remove ${destinationValue && 'enabled'}`} value={false} onClick={(event) => selectionChange(event, 'Destination')}>⨯</button>
        </span>
      </div>
    </>
  );
}

LineBarChart.propTypes = {
  appID: PropTypes.string.isRequired,
  commodities: PropTypes.instanceOf(Array).isRequired,
  commodityValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  destinations: PropTypes.instanceOf(Array).isRequired,
  destinationValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  destinationStatusValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  defineData: PropTypes.instanceOf(Function).isRequired,
  duration: PropTypes.number.isRequired,
  easingFn: PropTypes.instanceOf(Function).isRequired,
  features: PropTypes.bool.isRequired,
  idx: PropTypes.string.isRequired,
  setCommodityValue: PropTypes.instanceOf(Function).isRequired,
  setDestinationValue: PropTypes.instanceOf(Function).isRequired,
  setDuration: PropTypes.instanceOf(Function).isRequired
};

LineBarChart.defaultProps = {
};

export default LineBarChart;
