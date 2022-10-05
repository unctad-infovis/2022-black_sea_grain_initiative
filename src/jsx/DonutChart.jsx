import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import PropTypes from 'prop-types';

// @See https://d3-graph-gallery.com/graph/stackedarea_template.html

// Load helpers.
import * as d3 from 'd3';
import debounce from './helpers/Debounce.js';

// https://d3js.org/

function DonutChart({
  category, commodityValue, destinationValue, destinationStatusValue, idx, setCommodityValue, setDestinationValue, setDestinationStatusValue, setDuration, series
}) {
  series.columns = ['name', 'parent', 'value'];
  const [chartRefWidth, setChartRefWidth] = useState(0);

  const chartRef = useRef(null);

  const colors = useMemo(() => ['#009edb', '#72bf44', '#f58220', '#a05fb4', '#ffc800', '#aea29a'], []);

  const margin = 6;
  const max = (Math.max(...series.map(d => ((d.name === 'Other') ? 0 : d.value))));
  const prevWidth = useRef();

  useEffect(() => {
    document.querySelectorAll('.pie_chart_Commodity').forEach(el => el.classList.remove('selected'));
    if (commodityValue !== false) {
      document.querySelectorAll(`.pie_chart_Commodity_${commodityValue.replaceAll(' ', '_')}`)?.[0]?.classList.add('selected');
    }
  }, [commodityValue]);

  useEffect(() => {
    document.querySelectorAll('.pie_chart_Destination').forEach(el => el.classList.remove('selected'));
    if (destinationValue !== false) {
      document.querySelectorAll(`.pie_chart_Destination_${destinationValue.replaceAll(' ', '_')}`)?.[0]?.classList.add('selected');
    }
  }, [destinationValue]);

  useEffect(() => {
    document.querySelectorAll('.pie_chart_DestinationStatus').forEach(el => el.classList.remove('selected'));
    if (destinationStatusValue !== false) {
      document.querySelectorAll(`.pie_chart_DestinationStatus_${destinationStatusValue.replaceAll(' ', '_')}`)?.[0]?.classList.add('selected');
    }
  }, [destinationStatusValue]);

  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const createChart = useCallback((svg, width_container) => {
    const width = width_container - margin;
    svg.attr('width', width + margin);
    const height = width_container - margin;
    svg.attr('height', height + margin);

    const g = svg.select('g').attr('transform', `translate(${width / 2}, ${height / 2})`);
    const radius = Math.min(width, height) / 2 - margin;

    const data = [...series];

    const pie = d3.pie()
      .value((d) => d.value).padAngle(0.01);

    g.selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('d', d3.arc()
        .innerRadius(80)
        .outerRadius(radius))
      .attr('fill', (d, i) => ((d.data.name === 'Other') ? colors[colors.length - 1] : colors[i]))
      .attr('class', (d) => `pie_chart pie_chart_${category} pie_chart_${category}_${d.data.name.replaceAll(' ', '_')}`)
      .attr('stroke', '#fff')
      .style('stroke-width', '1px')
      .on('click', (event, d) => {
        if (category === 'Commodity') {
          setCommodityValue(([...event.target.classList].includes('selected')) ? false : d.data.name);
        } else if (category === 'Destination') {
          setDestinationValue(([...event.target.classList].includes('selected')) ? false : d.data.name);
        } else {
          setDestinationStatusValue(([...event.target.classList].includes('selected')) ? false : d.data.name);
        }
        setDuration(1000);
      });

    g.selectAll('text')
      .data(pie(data))
      .join('text')
      .attr('class', 'pie_text')
      .html((d) => `<tspan>${capitalizeFirstLetter(d.data.name.split(' ')[0])}</tspan> ${d.data.name.split(' ')[1] ? (`<tspan dy="1.2em" dx="-4.5em">${capitalizeFirstLetter(d.data.name.split(' ')[1])}</span>`) : ''}`)
      .attr('transform', (d) => `translate(${d3.arc().innerRadius(70).outerRadius(radius).centroid(d)})`)
      .attr('font-size', (d) => `${Math.min(((Math.log2(d.data.value) / Math.log2(max)) ** 4) * 20, 20)}px`)
      .style('font-family', 'Roboto');
  }, [category, colors, max, series, setCommodityValue, setDestinationValue, setDestinationStatusValue, setDuration]);

  useEffect(() => {
    const svg = d3.select(chartRef.current)
      .append('svg').attr(
        'transform',
        `translate(${margin}, ${margin})`
      );
    svg.append('g');
    createChart(svg, chartRef.current.offsetWidth);
  }, [createChart]);

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

DonutChart.propTypes = {
  category: PropTypes.string.isRequired,
  commodityValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  destinationValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  destinationStatusValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  idx: PropTypes.string.isRequired,
  series: PropTypes.instanceOf(Array).isRequired,
  setCommodityValue: PropTypes.instanceOf(Function).isRequired,
  setDestinationValue: PropTypes.instanceOf(Function).isRequired,
  setDestinationStatusValue: PropTypes.instanceOf(Function).isRequired,
  setDuration: PropTypes.instanceOf(Function).isRequired
};

DonutChart.defaultProps = {
};

export default DonutChart;
