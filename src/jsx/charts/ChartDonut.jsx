import React, { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

// https://www.highcharts.com/
import Highcharts from 'highcharts';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import highchartsExporting from 'highcharts/modules/exporting';
import highchartsExportData from 'highcharts/modules/export-data';
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

function DonutChart({
  allow_decimals, data, data_decimals, export_title_margin, idx, labels, note, show_only_first_and_last_labels, source, subtitle, tick_interval, title, xlabel, ymax, ymin, ystep
}) {
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const chartHeight = 600;
  const createChart = useCallback(() => {
    Highcharts.chart(`chartIdx${idx}`, {
      caption: {
        align: 'left',
        margin: 15,
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontSize: '14px'
        },
        text: `<em>Source:</em> ${source} ${note ? (`<br /><em>Note:</em> <span>${note}</span>`) : ''}`,
        verticalAlign: 'bottom',
        x: 0
      },
      chart: {
        events: {
          render() {
            setTimeout(() => {
              // eslint-disable-next-line react/no-this-in-sfc
              const left = this.plotWidth / 2 + this.plotLeft;
              // eslint-disable-next-line react/no-this-in-sfc
              const top = this.plotHeight / 2 + this.plotTop;
              // eslint-disable-next-line react/no-this-in-sfc
              if (!this.textLabel) {
                // eslint-disable-next-line react/no-this-in-sfc
                this.textLabel = this.renderer
                  .text('Tonnes', left, top, true)
                  .attr({
                    align: 'center',
                  })
                  .css({
                    color: '#000',
                    fontSize: '22px',
                    fontWeight: 700,
                  })
                  .add();
              }
              // eslint-disable-next-line react/no-this-in-sfc
              this.textLabel.attr({
                x: left,
                y: top - 20
              });
              // eslint-disable-next-line react/no-this-in-sfc
              if (!this.textValue) {
                // eslint-disable-next-line react/no-this-in-sfc
                this.textValue = this.renderer
                  .text(data[0].data.reduce((acc, val) => acc + val.y, 0).toLocaleString(), left, top + 30, true)
                  .attr({
                    align: 'center'
                  })
                  .css({
                    color: '#000',
                    fontSize: '24px',
                    fontWeight: 400,
                  })
                  .add();
              }
              // eslint-disable-next-line react/no-this-in-sfc
              this.textValue.attr({
                x: left,
                y: top + 15
              });
              // eslint-disable-next-line react/no-this-in-sfc
              if (!this.textMeta) {
                // eslint-disable-next-line react/no-this-in-sfc
                this.textMeta = this.renderer
                  .text('Wheat', left, top, true)
                  .attr({
                    align: 'center',
                  })
                  .css({
                    color: '#000',
                    fontSize: '22px',
                    fontWeight: 700,
                  })
                  .add();
              }
              // eslint-disable-next-line react/no-this-in-sfc
              this.textMeta.attr({
                x: left,
                y: top + 45
              });
            }, 3200);
          },
          load() {
            // eslint-disable-next-line react/no-this-in-sfc
            this.renderer.image('https://unctad.org/sites/default/files/2022-06/unctad_logo.svg', 5, 15, 80, 100).add();
          }
        },
        height: chartHeight,
        marginRight: 20,
        type: 'pie',
        resetZoomButton: {
          theme: {
            fill: '#fff',
            r: 0,
            states: {
              hover: {
                fill: '#0077b8',
                stroke: 'transparent',
                style: {
                  color: '#fff'
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
      colors: ['#c5dfef', '#009edb', '#004987'],
      credits: {
        enabled: false
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
        enabled: false
      },
      plotOptions: {
        series: {
          states: {
            hover: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: labels,
            formatter() {
            // eslint-disable-next-line react/no-this-in-sfc
              return `<div style="text-align:center; color: #000;">${this.key}<br />${roundNr(this.percentage, data_decimals)}%</div>`;
            }
          }
        },
        pie: {
          animation: {
            duration: 3000,
          },
          innerSize: '50%',
          cursor: 'pointer',
          dataLabels: {
            enabled: labels,
            formatter() {
              // eslint-disable-next-line react/no-this-in-sfc
              return `<div style="text-shadow: 1px 1px 1px ${this.color}">${this.key}<br />${roundNr(this.percentage, data_decimals)}%</div>`;
            },
            position: 'center',
            style: {
              fontFamily: 'Roboto',
              fontSize: '18px',
              textAnchor: 'middle',
              fontWeight: 400,
              textAlign: 'center',
              textOutline: '0px solid #000'
            }
          },
          events: {
            legendItemClick() {
              return false;
            }
          },
          states: {
            hover: {
              halo: {
                size: 0
              },
              enabled: false
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
            if (show_only_first_and_last_labels === true) {
              // eslint-disable-next-line react/no-this-in-sfc
              return (this.isLast || this.isFirst || (this.pos === parseInt(this.tick.axis.dataMax / 2, 10))) ? this.value : undefined;
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
            return (allow_decimals) ? this.value.toFixed(2) : `${(this.value / 1000000).toFixed(1)}M`;
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
        showFirstLabel: false,
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
  }, [allow_decimals, data, data_decimals, export_title_margin, idx, labels, note, show_only_first_and_last_labels, source, subtitle, tick_interval, title, xlabel, ymax, ymin, ystep]);

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

DonutChart.propTypes = {
  allow_decimals: PropTypes.bool,
  data: PropTypes.instanceOf(Array).isRequired,
  data_decimals: PropTypes.number.isRequired,
  export_title_margin: PropTypes.number,
  idx: PropTypes.string.isRequired,
  labels: PropTypes.bool,
  note: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  show_only_first_and_last_labels: PropTypes.bool,
  source: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  tick_interval: PropTypes.number,
  title: PropTypes.string.isRequired,
  xlabel: PropTypes.string,
  ymax: PropTypes.number,
  ymin: PropTypes.number,
  ystep: PropTypes.number
};

DonutChart.defaultProps = {
  allow_decimals: true,
  export_title_margin: 0,
  labels: true,
  note: false,
  show_only_first_and_last_labels: false,
  subtitle: false,
  tick_interval: 1,
  xlabel: '',
  ymax: undefined,
  ymin: undefined,
  ystep: 1
};

export default DonutChart;
