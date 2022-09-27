import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// @See https://d3-graph-gallery.com/graph/stackedarea_template.html

// Load helpers.
import * as d3 from 'd3';
import debounce from './Debounce.js';

// https://d3js.org/

function TreeMapChart({
  category, commodityValue, countryValue, idx, setCommodityValue, setCountryValue, setDuration, series
}) {
  series.columns = ['name', 'parent', 'value'];
  const chartRef = useRef(null);
  const [chartRefWidth, setChartRefWidth] = useState(0);
  const prevWidth = useRef();
  const max = (Math.max(...series.map(d => ((d.name === 'Other') ? 0 : d.value))));
  const colors = ['#009edb', '#72bf44', '#f58220', '#a05fb4', '#ffc800', '#aea29a'];
  const margin = {
    bottom: 0, left: -6, right: 0, top: 0
  };

  useEffect(() => {
    document.querySelectorAll('.treemap_rect_Commodity').forEach(el => el.classList.remove('selected'));
    if (commodityValue !== false) {
      document.querySelectorAll(`.treemap_rect_Commodity_${commodityValue.replaceAll(' ', '_')}`)?.[0]?.classList.add('selected');
    }
  }, [commodityValue]);

  useEffect(() => {
    document.querySelectorAll('.treemap_rect_Country').forEach(el => el.classList.remove('selected'));
    if (countryValue !== false) {
      document.querySelectorAll(`.treemap_rect_Country_${countryValue.replaceAll(' ', '_')}`)?.[0]?.classList.add('selected');
    }
  }, [countryValue]);

  const createChart = (svg, width_container) => {
    // set the dimensions and margins of the graph
    const width = width_container - margin.left - margin.right;
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
      .attr('class', (d) => `treemap_rect treemap_rect_${category} treemap_rect_${category}_${d.data.name.replaceAll(' ', '_')}`)
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .style('fill', (d, i) => ((d.data.name === 'Other') ? colors[colors.length - 1] : colors[i]))
      .on('click', (event, d) => {
        if (category === 'Commodity') {
          setCommodityValue(([...event.target.classList].includes('selected')) ? false : d.data.name);
        } else {
          setCountryValue(([...event.target.classList].includes('selected')) ? false : d.data.name);
        }
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
    createChart(svg, chartRef.current.offsetWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      createChart(d3.select(chartRef.current).selectAll('svg'), chartRef.current.offsetWidth);
    }
  };

  window.addEventListener('resize', debounce(resizeContent, 150));

  return (
    <div>
      <div className={`dashboard_chart chart_${idx}`} ref={chartRef} />
    </div>
  );
}

TreeMapChart.propTypes = {
  category: PropTypes.string.isRequired,
  commodityValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  countryValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  idx: PropTypes.string.isRequired,
  series: PropTypes.instanceOf(Array).isRequired,
  setCommodityValue: PropTypes.instanceOf(Function).isRequired,
  setCountryValue: PropTypes.instanceOf(Function).isRequired,
  setDuration: PropTypes.instanceOf(Function).isRequired
};

TreeMapChart.defaultProps = {
};

export default TreeMapChart;
