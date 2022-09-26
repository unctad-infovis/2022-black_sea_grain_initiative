import React, { /* useState, */useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// @See https://d3-graph-gallery.com/graph/stackedarea_template.html

// https://d3js.org/
import * as d3 from 'd3';

function TreeMapChart({
  category, idx, series, setType, setDuration, setValue
}) {
  series.columns = ['name', 'parent', 'value'];
  const chartRef = useRef(null);
  const max = (Math.max(...series.map(d => ((d.name === 'Other') ? 0 : d.value))));
  const colors = ['#009edb', '#72bf44', '#f58220', '#a05fb4', '#ffc800', '#aea29a'];
  const margin = {
    top: 0, right: 0, bottom: 0, left: -6
  };

  const createChart = (svg) => {
    // set the dimensions and margins of the graph
    const width = chartRef.current.offsetWidth - margin.left - margin.right;
    svg.attr('width', width + margin.left - margin.right);
    const height = 300 - margin.top - margin.bottom;
    svg.attr('height', height + margin.top + margin.bottom);

    // append the svg object to the body of the page

    const root = d3.stratify()
      .id((d) => d.name)
      .parentId((d) => d.parent)(series);
    root.sum((d) => +d.value);

    d3.treemap()
      .size([width, height])
      .padding(6)(root);

    svg.join('g').attr('class', 'treemap').selectAll('rect')
      .data(root.leaves())
      .join('rect')
      .attr('class', 'treemap_rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .style('fill', (d, i) => ((d.data.name === 'Other') ? colors[colors.length - 1] : colors[i]))
      .on('click', (event, d) => {
        setType(category);
        setValue(d.data.name);
        setDuration(1000);
      });

    svg.join('g').selectAll('.treemap_text')
      .data(root.leaves())
      .join('text')
      .attr('class', 'treemap_text')
      .attr('x', (d) => d.x0 + 10)
      .attr('y', (d) => d.y0 + 25)
      .text((d) => ((idx === '3' && d.data.name === 'Other') ? `${d.data.name} destinations` : d.data.name))
      .attr('font-size', (d) => `${Math.min(((Math.log2(d.data.value) / Math.log2(max)) ** 4) * 20, 20)}px`);

    svg.join('g').selectAll('.treemap_val')
      .data(root.leaves())
      .join('text')
      .attr('class', 'treemap_val')
      .attr('x', (d) => d.x0 + 10)
      .attr('y', (d) => d.y0 + Math.min(((Math.log2(d.data.value) / Math.log2(max))) * 48, 48))
      .text((d, i) => ((i === 0 && idx === '2') ? `${d.data.value.toLocaleString()} metric tons` : d.data.value.toLocaleString()))
      .attr('font-size', (d) => `${Math.min(((Math.log2(d.data.value) / Math.log2(max)) ** 4) * 20, 20)}px`);
  };

  useEffect(() => {
    const svg = d3.select(chartRef.current)
      .append('svg').attr(
        'transform',
        `translate(${margin.left}, ${margin.top})`
      );

    createChart(svg);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  window.addEventListener('resize', () => createChart(d3.select(chartRef.current).selectAll('svg')));

  return (
    <div>
      <div className={`dashboard_chart chart_${idx}`} ref={chartRef} />
    </div>
  );
}

TreeMapChart.propTypes = {
  category: PropTypes.string.isRequired,
  idx: PropTypes.string.isRequired,
  series: PropTypes.instanceOf(Array).isRequired,
  setDuration: PropTypes.instanceOf(Function).isRequired,
  setType: PropTypes.instanceOf(Function).isRequired,
  setValue: PropTypes.instanceOf(Function).isRequired
};

TreeMapChart.defaultProps = {
};

export default TreeMapChart;
