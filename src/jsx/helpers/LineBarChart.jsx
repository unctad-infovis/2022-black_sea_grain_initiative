import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// @See https://bl.ocks.org/htakeuchi/a60c0ecb55713c06c054c26c6dbed57a

// https://d3js.org/
import * as d3 from 'd3';

function LineBarChart({
  appID, idx, defineData, durationExt, type, value
}) {
  const chartRef = useRef(null);
  const [g, setG] = useState(false);

  const margin = {
    top: 40, right: 50, bottom: 30, left: 40
  };
  const height = 300 - margin.top - margin.bottom;

  const x = d3.scaleBand();
  const createChart = (svg) => {
    const width = chartRef.current.offsetWidth - margin.left - margin.right;
    svg.attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    x.rangeRound([0, chartRef.current.offsetWidth - margin.left - margin.right]).padding(0.1);
    svg.selectAll('.axis_y_right').attr('transform', `translate(${width}, 0)`);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const xAxis = d3.axisBottom().scale(x).tickValues(['2022-08-01', '2022-08-10', '2022-08-20', '2022-09-01', '2022-09-10', '2022-09-20']);

  const yLeft = d3.scaleLinear().range([height, 0]);
  const yAxisLeft = d3.axisLeft().scale(yLeft).ticks(5).tickFormat(val => ((val !== 0) ? `${(val / 1000).toLocaleString()}k` : ''));
  const yRight = d3.scaleLinear().range([height, 0]);
  const yAxisRight = d3.axisRight().scale(yRight).ticks(5).tickFormat(val => ((val !== 0) ? `${(val / 1000).toLocaleString()}k` : ''));

  const updateData = (selected_series, duration) => {
    if (g) {
      x.domain(selected_series.map((d) => d[0]));
      x.rangeRound([0, chartRef.current.offsetWidth - margin.left - margin.right]).padding(0.1);
      g.selectAll('.axis_x')
        .call(xAxis);

      yLeft.domain([0, d3.max(selected_series, ((d) => d[1]))]);
      yRight.domain([0, d3.max(selected_series, ((d) => d[2]))]);

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
  };

  updateData(defineData(type, value), durationExt);

  window.addEventListener('resize', () => {
    createChart(d3.select(chartRef.current).selectAll('svg'));
    updateData(defineData(type, value), durationExt);
  });

  return (
    <div>
      <div className="legend_container">
        <div className="line_legend_container">
          <span className="legend_icon" />
          <span className="legend_text">In total</span>
        </div>
        <div className="bar_legend_container">
          <span className="legend_icon" />
          <span className="legend_text">Per day</span>
        </div>
      </div>
      <div className={`dashboard_chart chart_${idx}`} ref={chartRef} />
      <div className="selection_container">
        <div className="instruction">Choose a commodity or country of interest</div>
        <button type="button" onClick={() => updateData(defineData(), 1000)}>Total</button>
        <span className="selection_label">Commodity</span>
        <button type="button" onClick={() => updateData(defineData('Commodity', 'Wheat'), 1000)}>Wheat</button>
        <button type="button" onClick={() => updateData(defineData('Commodity', 'Corn'), 1000)}>Corn</button>
        <span className="selection_label">Country</span>
        <button type="button" onClick={() => updateData(defineData('Country', 'Spain'), 1000)}>Spain</button>
        <button type="button" onClick={() => updateData(defineData('Country', 'Türkiye'), 1000)}>Türkiye</button>
      </div>
    </div>
  );
}

LineBarChart.propTypes = {
  appID: PropTypes.string.isRequired,
  defineData: PropTypes.instanceOf(Function).isRequired,
  idx: PropTypes.string.isRequired,
  durationExt: PropTypes.number.isRequired,
  type: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired
};

LineBarChart.defaultProps = {
};

export default LineBarChart;
