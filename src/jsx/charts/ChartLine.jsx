import React, { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

// https://www.highcharts.com/
import Highcharts from 'highcharts';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import highchartsExporting from 'highcharts/modules/exporting';
import highchartsExportData from 'highcharts/modules/export-data';
import highchartsAnnotations from 'highcharts/modules/annotations';
import highchartsMore from 'highcharts/highcharts-more';
import highchartsRegression from 'highcharts-regression';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

// Load helpers.
import roundNr from '../helpers/RoundNr.js';

highchartsAccessibility(Highcharts);
highchartsRegression(Highcharts);
highchartsExporting(Highcharts);
highchartsExportData(Highcharts);
highchartsMore(Highcharts);
highchartsAnnotations(Highcharts);

Highcharts.setOptions({
  lang: {
    decimalPoint: '.',
    downloadCSV: 'Download CSV data',
    thousandsSep: ','
  }
});
Highcharts.SVGRenderer.prototype.symbols.download = (x, y, w, h) => {
  const path = [
    // Arrow stem
    'M', x + w * 0.5, y,
    'L', x + w * 0.5, y + h * 0.7,
    // Arrow head
    'M', x + w * 0.3, y + h * 0.5,
    'L', x + w * 0.5, y + h * 0.7,
    'L', x + w * 0.7, y + h * 0.5,
    // Box
    'M', x, y + h * 0.9,
    'L', x, y + h,
    'L', x + w, y + h,
    'L', x + w, y + h * 0.9
  ];
  return path;
};

function LineChart({
  allow_decimals, annotations, data, data_decimals, export_title_margin, idx, labels, line_width, note, show_first_label, show_only_first_and_last_labels, source, subtitle, suffix, tick_interval, tick_interval_y, title, xlabel, x_labels_month_year, ymax, ymin, ystep
}) {
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const chartHeight = 600;
  const createChart = useCallback(() => {
    Highcharts.chart(`chartIdx${idx}`, {
      annotations: [{
        draggable: '',
        labelOptions: {
          x: 0,
          y: -30
        },
        labels: [{
          backgroundColor: 'transparent',
          borderWidth: 0,
          point: {
            x: 66.5,
            xAxis: 0,
            y: 425,
            yAxis: 0
          },
          style: {
            color: '#333',
            fontFamily: 'Roboto',
            fontSize: '20px',
            fontWeight: 700,
            textOutline: '3px solid #fff'
          },
          text: 'Prices going up again',
        }],
        shapes: [{
          fill: '#333',
          markerEnd: 'arrow-head',
          points: [{
            x: 62,
            xAxis: 0,
            y: 475,
            yAxis: 0
          }, {
            x: 66.5,
            xAxis: 0,
            y: 423.5,
            yAxis: 0
          }],
          strokeWidth: 3,
          type: 'path',
          width: 10
        }, {
          fill: '#333',
          markerEnd: 'arrow-head',
          points: [{
            x: 62,
            xAxis: 0,
            y: 475,
            yAxis: 0
          }, {
            x: 67,
            xAxis: 0,
            y: 330,
            yAxis: 0
          }],
          strokeWidth: 3,
          type: 'path',
          width: 10
        }],
        visible: annotations
      }],
      caption: {
        align: 'left',
        margin: 15,
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontFamily: 'Roboto',
          fontSize: '14px'
        },
        text: `<em>Source:</em> ${source} ${note ? (`<br /><em>Note:</em> <span>${note}</span>`) : ''}`,
        verticalAlign: 'bottom',
        x: 0
      },
      chart: {
        events: {
          load() {
            // eslint-disable-next-line react/no-this-in-sfc
            this.renderer.image('https://unctad.org/sites/default/files/2022-06/unctad_logo.svg', 5, 15, 80, 100).add();
            setTimeout(() => {
              if (show_only_first_and_last_labels === true) {
                // eslint-disable-next-line react/no-this-in-sfc
                this.series.forEach((series) => {
                  if (series.userOptions.isRegressionLine !== true) {
                    series.points[series.points.length - 1].update({
                      dataLabels: {
                        enabled: true,
                        padding: 0,
                        x: 0,
                        y: 35
                      }
                    });
                    series.points[0].update({
                      dataLabels: {
                        enabled: true,
                        y: 0
                      }
                    });
                  }
                });
              }
            }, 2800);
          }
        },
        height: chartHeight,
        marginRight: 20,
        type: 'line',
        resetZoomButton: {
          theme: {
            fill: '#fff',
            r: 0,
            states: {
              hover: {
                fill: '#0077b8',
                stroke: 'transparent',
                style: {
                  color: '#fff',
                  fontFamily: 'Roboto',
                }
              }
            },
            stroke: '#7c7067',
            style: {
              fontFamily: 'Roboto',
              fontSize: '13px',
              fontWeight: 400
            }
          }
        },
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontFamily: 'Roboto',
          fontWeight: 400
        },
        zoomType: 'x'
      },
      colors: ['#009edb', '#72bf44', '#a066aa', '#f58220'],
      credits: {
        enabled: false
      },
      defs: {
        marker0: {
          tagName: 'marker',
          children: [{
            tagName: 'path',
            d: 'M 0 0 V 4 L 3 2 Z'
          }],
          attributes: {
            id: 'arrow-head',
            markerWidth: 6,
            fill: '#000',
            markerHeight: 4,
            refX: 0.1,
            refY: 2
          }
        }
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['viewFullscreen', 'separator', 'downloadPNG', 'downloadPDF', 'separator', 'downloadCSV'],
            symbol: 'download',
            symbolFill: '#000'
          }
        }
      },
      legend: {
        align: 'right',
        enabled: (data.length > 1),
        itemStyle: {
          color: '#000',
          cursor: 'default',
          fontFamily: 'Roboto',
          fontSize: '14px',
          fontWeight: 400
        },
        layout: 'horizontal',
        margin: 0,
        verticalAlign: 'top'
      },
      plotOptions: {
        arearange: {
          animation: {
            duration: 3000,
          }
        },
        line: {
          animation: {
            duration: 3000,
          },
          cursor: 'pointer',
          dataLabels: {
            enabled: labels,
            formatter() {
              // eslint-disable-next-line react/no-this-in-sfc
              return `<div style="color: ${this.color}">${roundNr(this.y, data_decimals)}</div>`;
            },
            style: {
              color: 'rgba(0, 0, 0, 0.8)',
              fontFamily: 'Roboto',
              fontSize: '22px',
              fontWeight: 400,
              textOutline: '3px solid #fff'
            }
          },
          events: {
            legendItemClick() {
              return false;
            },
            mouseOver() {
              return false;
            }
          },
          selected: true,
          lineWidth: line_width,
          marker: {
            enabled: false,
            radius: 0,
            states: {
              hover: {
                animation: false,
                enabled: false,
                radius: 8
              }
            },
            symbol: 'circle'
          },
          states: {
            hover: {
              halo: {
                size: 0
              },
              enabled: false,
              lineWidth: line_width,
            }
          }
        }
      },
      responsive: {
        rules: [{
          chartOptions: {
            legend: {
              layout: 'horizontal'
            }
          },
          condition: {
            maxWidth: 500
          }
        }]
      },
      series: data,
      subtitle: {
        align: 'left',
        enabled: true,
        widthAdjust: -144,
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '18px'
        },
        x: 100,
        text: subtitle
      },
      title: {
        align: 'left',
        margin: export_title_margin,
        widthAdjust: -144,
        style: {
          color: '#000',
          fontSize: '30px',
          fontWeight: 700,
          lineHeight: '34px'
        },
        x: 100,
        text: title
      },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderRadius: 0,
        borderWidth: 1,
        crosshairs: true,
        formatter() {
          // eslint-disable-next-line react/no-this-in-sfc
          const values = this.points.filter(point => point.series.userOptions.isRegressionLine !== true && point.series.name !== '').map(point => [point.series.name.split(' (')[0], point.y, point.color]);
          const rows = [];
          rows.push(values.map(point => `<div style="color: ${point[2]}"><span class="tooltip_label">${(point[0]) ? `${point[0]}: ` : ''}</span><span class="tooltip_value">${roundNr(point[1], data_decimals)}${suffix}</span></div>`).join(''));
          // eslint-disable-next-line react/no-this-in-sfc
          return `<div class="tooltip_container"><h3 class="tooltip_header">${xlabel} ${this.x}</h3>${rows} ${this.points[0].point.x}</div>`;
        },
        shadow: false,
        shared: true,
        useHTML: true
      },
      xAxis: {
        accessibility: {
          description: xlabel
        },
        allowDecimals: false,
        categories: data[0].labels,
        crosshair: {
          color: 'transparent',
          width: 1
        },
        labels: {
          allowOverlap: false,
          formatter() {
            if (x_labels_month_year) {
              // eslint-disable-next-line react/no-this-in-sfc
              if (new Date(this.value).toLocaleString([], { month: 'short' }) === 'Jan') {
              // eslint-disable-next-line react/no-this-in-sfc
                return `${new Date(this.value).toLocaleString([], { month: 'short' })}<br />${(new Date(this.value)).getFullYear()}`;
              }
              // eslint-disable-next-line react/no-this-in-sfc
              return (new Date(this.value).toLocaleString([], { month: 'short' }));
            }
            // eslint-disable-next-line react/no-this-in-sfc
            return this.value;
          },
          step: 1,
          enabled: true,
          rotation: 0,
          reserveSpace: true,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400
          },
          useHTML: false,
          y: 30
        },
        lineColor: 'transparent',
        lineWidth: 0,
        plotBands: (idx === '9' || idx === '10') ? [{
          color: '#eee',
          from: (idx === '9' ? 30.7 : 30.7),
          to: 100,
          label: {
            align: 'left',
            style: {
              color: 'rgba(0, 0, 0, 0.8)',
              fontFamily: 'Roboto',
              fontSize: '16px',
              verticalAlign: 'bottom',
              fontWeight: 700
            },
            rotation: 0,
            text: '',
            x: 5,
            y: 20
          }
        }] : [],
        plotLines: (idx === '9' || idx === '10') ? [{
          color: '#72bf44',
          label: {
            align: 'right',
            style: {
              color: 'rgba(0, 0, 0, 0.8)',
              fontFamily: 'Roboto',
              fontSize: '16px',
              fontWeight: 700,
            },
            rotation: 0,
            verticalAlign: 'bottom',
            text: 'Initiative brokered<br />on 22 July 2022',
            x: -10,
            y: -50
          },
          zIndex: 10,
          value: (idx === '9' ? 30.7 : 30.7),
          width: 3
        }] : [],
        rotation: 0,
        opposite: false,
        tickInterval: tick_interval,
        tickWidth: 1,
        tickLength: 5,
        title: {
          enabled: true,
          offset: 40,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400
          },
          text: xlabel
        }
      },
      yAxis: {
        accessibility: {
          description: 'Index'
        },
        allowDecimals: allow_decimals,
        custom: {
          allowNegativeLog: true
        },
        gridLineColor: 'rgba(124, 112, 103, 0.2)',
        gridLineDashStyle: 'shortdot',
        gridLineWidth: 1,
        labels: {
          formatter() {
            // eslint-disable-next-line react/no-this-in-sfc
            return (allow_decimals) ? this.value.toFixed(2) : `${(this.value).toFixed(data_decimals)}${suffix}`;
          },
          step: ystep,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400
          }
        },
        lineColor: 'transparent',
        lineWidth: 0,
        max: ymax,
        min: ymin,
        opposite: false,
        plotLines: [{
          color: 'rgba(124, 112, 103, 0.6)',
          value: 0,
          width: 1
        }],
        tickInterval: tick_interval_y,
        showFirstLabel: show_first_label,
        showLastLabel: true,
        title: {
          align: 'high',
          enabled: true,
          reserveSpace: false,
          rotation: 0,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400
          },
          text: '',
          verticalAlign: 'top',
          x: 94,
          y: -25
        },
        type: 'linear'
      }
    });
    chartRef.current.querySelector(`#chartIdx${idx}`).style.opacity = 1;
  }, [allow_decimals, annotations, data, data_decimals, export_title_margin, idx, labels, line_width, note, show_first_label, show_only_first_and_last_labels, source, subtitle, suffix, tick_interval, tick_interval_y, title, xlabel, x_labels_month_year, ymax, ymin, ystep]);

  useEffect(() => {
    if (isVisible === true) {
      setTimeout(() => {
        createChart();
      }, 300);
    }
  }, [createChart, isVisible]);

  return (
    <div className="chart_container" style={{ minHeight: chartHeight }}>
      <div ref={chartRef}>
        {(isVisible) && (<div className="chart" id={`chartIdx${idx}`} />)}
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

LineChart.propTypes = {
  allow_decimals: PropTypes.bool,
  annotations: PropTypes.bool,
  data: PropTypes.instanceOf(Array).isRequired,
  data_decimals: PropTypes.number.isRequired,
  export_title_margin: PropTypes.number,
  idx: PropTypes.string.isRequired,
  labels: PropTypes.bool,
  line_width: PropTypes.number,
  note: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  show_first_label: PropTypes.bool,
  show_only_first_and_last_labels: PropTypes.bool,
  source: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  suffix: PropTypes.string,
  tick_interval: PropTypes.number,
  tick_interval_y: PropTypes.number,
  title: PropTypes.string.isRequired,
  xlabel: PropTypes.string,
  x_labels_month_year: PropTypes.bool,
  ymax: PropTypes.number,
  ymin: PropTypes.number,
  ystep: PropTypes.number
};

LineChart.defaultProps = {
  allow_decimals: true,
  annotations: false,
  export_title_margin: 0,
  labels: true,
  line_width: 5,
  note: false,
  show_first_label: true,
  show_only_first_and_last_labels: false,
  subtitle: false,
  suffix: '',
  tick_interval: 1,
  tick_interval_y: undefined,
  xlabel: '',
  x_labels_month_year: false,
  ymax: undefined,
  ymin: undefined,
  ystep: 1
};

export default LineChart;
