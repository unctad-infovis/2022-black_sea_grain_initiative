import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import PropTypes from 'prop-types';

// @See https://d3-graph-gallery.com/graph/stackedarea_template.html

// Load helpers.
import * as d3 from 'd3';
import debounce from './Debounce.js';

// https://d3js.org/

function DonutChart({
  category, commodityValue, countryValue, countryStatusValue, idx, setCommodityValue, setCountryValue, setCountryStatusValue, setDuration, series
}) {
  series.columns = ['name', 'parent', 'value'];
  const chartRef = useRef(null);
  const [chartRefWidth, setChartRefWidth] = useState(0);
  const prevWidth = useRef();
  const max = (Math.max(...series.map(d => ((d.name === 'Other') ? 0 : d.value))));
  const colors = useMemo(() => ['#009edb', '#72bf44', '#f58220', '#a05fb4', '#ffc800', '#aea29a'], []);
  const margin = 6;

  useEffect(() => {
    document.querySelectorAll('.pie_chart_Commodity').forEach(el => el.classList.remove('selected'));
    if (commodityValue !== false) {
      document.querySelectorAll(`.pie_chart_Commodity_${commodityValue.replaceAll(' ', '_')}`)?.[0]?.classList.add('selected');
    }
  }, [commodityValue]);

  useEffect(() => {
    document.querySelectorAll('.pie_chart_Country').forEach(el => el.classList.remove('selected'));
    if (countryValue !== false) {
      document.querySelectorAll(`.pie_chart_Country_${countryValue.replaceAll(' ', '_')}`)?.[0]?.classList.add('selected');
    }
  }, [countryValue]);

  useEffect(() => {
    document.querySelectorAll('.pie_chart_CountryStatus').forEach(el => el.classList.remove('selected'));
    if (countryStatusValue !== false) {
      document.querySelectorAll(`.pie_chart_CountryStatus_${countryStatusValue.replaceAll(' ', '_')}`)?.[0]?.classList.add('selected');
    }
  }, [countryStatusValue]);

  const createChart = useCallback((svg, width_container) => {
    const width = width_container - margin;
    svg.attr('width', width + margin);
    const height = width_container - margin;
    svg.attr('height', height + margin);

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);
    const radius = Math.min(width, height) / 2 - margin;

    const data = [...series];

    const pie = d3.pie()
      .value((d) => d.value).padAngle(0.02);

    g.selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius))
      .attr('fill', (d, i) => ((d.data.name === 'Other') ? colors[colors.length - 1] : colors[i]))
      .attr('class', (d) => `pie_chart pie_chart_${category} pie_chart_${category}_${d.data.name.replaceAll(' ', '_')}`)
      .attr('stroke', '#fff')
      .style('stroke-width', '2px')
      .on('click', (event, d) => {
        if (category === 'Commodity') {
          setCommodityValue(([...event.target.classList].includes('selected')) ? false : d.data.name);
        } else if (category === 'Country') {
          setCountryValue(([...event.target.classList].includes('selected')) ? false : d.data.name);
        } else {
          setCountryStatusValue(([...event.target.classList].includes('selected')) ? false : d.data.name);
        }
        setDuration(1000);
      });

    g.selectAll('text')
      .data(pie(data))
      .join('text')
      .attr('class', 'pie_text')
      .text((d) => d.data.name)
      .attr('transform', (d) => `translate(${d3.arc().innerRadius(0).outerRadius(radius).centroid(d)})`)
      .attr('font-size', (d) => `${Math.min(((Math.log2(d.data.value) / Math.log2(max)) ** 4) * 20, 20)}px`)
      .attr('font-size', '20px');
  }, [category, colors, max, series, setCommodityValue, setCountryValue, setCountryStatusValue, setDuration]);

  useEffect(() => {
    const svg = d3.select(chartRef.current)
      .append('svg').attr(
        'transform',
        `translate(${margin}, ${margin})`
      );
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
  countryValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  countryStatusValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  idx: PropTypes.string.isRequired,
  series: PropTypes.instanceOf(Array).isRequired,
  setCommodityValue: PropTypes.instanceOf(Function).isRequired,
  setCountryValue: PropTypes.instanceOf(Function).isRequired,
  setCountryStatusValue: PropTypes.instanceOf(Function).isRequired,
  setDuration: PropTypes.instanceOf(Function).isRequired
};

DonutChart.defaultProps = {
};

export default DonutChart;
