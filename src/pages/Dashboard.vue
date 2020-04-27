<template>
  <div>

    <!--Stats cards-->
    <div class="row">
      <div class="col-md-6 col-xl-3" v-for="stats in statsCards" :key="stats.title">
        <stats-card>
          <div class="icon-big text-center" :class="`icon-${stats.type}`" slot="header">
            <i :class="stats.icon"></i>
          </div>
          <div class="numbers" slot="content">
            <p>{{stats.title}}</p>
            {{stats.value}}
          </div>
          <div class="stats" slot="footer">
            <i :class="stats.footerIcon"></i> {{stats.footerText}}
          </div>
        </stats-card>
      </div>
    </div>

    <!--Charts-->
    <div class="row">
      <div class="col-12">
        <card title="Standard script outputs per day" subTitle="Usage of standard scripts in outputs on the entire Bitcoin blockchain">
          <div class="card-body">
            <highcharts
              v-if="scriptChartSeries.length > 0"
              :options="scriptChartOptions"
              :constructor-type="'stockChart'"
            ></highcharts>
          </div>
          <hr>
          <div class="stats">
            <i class="ti-reload"></i> {{chartsFooterText}}
          </div>
        </card>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 col-12">
        <card title="OP_RETURN Protocols" subTitle="Publicly known protocols using the operator">
          <div class="card-body">
            <highcharts
              v-if="protocolChartSeries.length > 0"
              :options="protocolChartOptions"
            ></highcharts>
          </div>
          <hr>
          <div class="stats">
            <i class="ti-reload"></i> {{chartsFooterText}}
          </div>
        </card>
      </div>

      <div class="col-md-6 col-12">
        <card title="OP_RETURN Output Size" subTitle="The average size of outputs using the operator">
          <div class="card-body">
            <highcharts
              v-if="sizeChartSeries.length > 0"
              :options="sizeChartOptions"
              :constructor-type="'stockChart'"
            ></highcharts>
          </div>
          <hr>
          <div class="stats">
            <i class="ti-reload"></i> {{chartsFooterText}}
          </div>
        </card>
      </div>
    </div>

  </div>
</template>

<script>
import { Card, StatsCard } from "@/components/index";
import Highcharts from "highcharts";
import stockInit from "highcharts/modules/stock";
import exporting from "highcharts/modules/exporting";
import exportData from "highcharts/modules/export-data";
import axios from "axios";
import api from "../assets/config/api.js";
import moment from "moment";

stockInit(Highcharts);
exporting(Highcharts);
exportData(Highcharts);

export default {
  components: {
    Card,
    StatsCard
  },
  data() {
    return {
      refreshHandler: 0,
      timers: {
        totalOutputs: null,
        charts: null
      },
      chartsFooterText: "Updated just now",
      sliderValue: [Math.floor(new Date().getTime() / 1000)],
      sliderOptions: {
        min: Math.floor(new Date("2013-01-01").getTime() / 1000),
        max: Math.floor(new Date().getTime() / 1000)
      },
      scriptChartOptions: {
        chart: {
          type: "area",
          height: 400,
          zoomType: "x",
          spacingLeft: 20,
          spacingRight: 20
        },
        colors: ["#03A9F4", "#E91E63", "#8bc34a", "#795548", "#ff5722", "#ffc107"],
        yAxis: {
          allowDecimals: false,
          labels: {
            formatter: function() {
              return this.value;
            }
          },
          plotLines: [
            {
              value: 0,
              width: 2,
              color: "silver"
            }
          ],
          reversedStacks: false
        },
        xAxis: {
          type: "datetime",
          setExtremes: function() {}
        },
        navigator: {
          enabled: false
        },
        scrollbar: {
          enabled: false,
          liveRedraw: false
        },
        plotOptions: {
          series: {
            stacking: "normal" // "normal" for normal stacking, "percent" for 100% stacking
          }
        },
        legend: {
          enabled: true,
          floating: false,
          layout: "horizontal"
        },
        exporting: {
          enabled: true,
          buttons: {
            contextButton: {
              text: "",
              menuItems: [
                "printChart",
                "separator",
                "downloadPNG",
                "downloadJPEG",
                "downloadPDF",
                "downloadSVG",
                "separator",
                "downloadCSV",
                "downloadXLS"
              ]
            },
            customButton: {
              text: "Switch View",
              align: "right",
              verticalAlign: "top",
              onclick: this.changeScriptChartView
            }
          }
        },
        tooltip: {
          valueDecimals: 0,
          formatter: function() {
            var labels = [];
            var sum = 0;
            this.points.forEach(el => (sum += Math.ceil(el.y)));

            this.points.forEach(el =>
              labels.push(
                el.series.name +
                  ": " +
                  Math.ceil(el.y).toLocaleString() +
                  " (" +
                  (el.y > 0 ? ((el.y / sum) * 100).toFixed(2) : "0") +
                  "%)"
              )
            );

            return [
              moment(this.x)
                .format("dddd, MMM D, YYYY")
                .toString()
            ].concat(labels);
          }
        },
        rangeSelector: {
          enabled: true,
          inputEnabled: false,
          allButtonsEnabled: true
        },
        credits: {
          enabled: false
        },
        loading: {
          hideDuration: 1000,
          showDuration: 1000
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                rangeSelector: {
                  enabled: false
                }
              }
            }
          ]
        },
        series: []
      },
      scriptChartSeries: [],
      sizeChartOptions: {
        chart: {
          type: "line",
          height: 400,
          zoomType: "x",
          spacingLeft: 20,
          spacingRight: 20
        },
        colors: ["#03A9F4"],
        title: {
          text: ""
        },
        yAxis: {
          allowDecimals: false,
          labels: {
            formatter: function() {
              return this.value + " bytes";
            }
          },
          plotLines: [
            {
              value: 0,
              width: 2,
              color: "silver"
            }
          ],
          reversedStacks: false
        },
        xAxis: {
          type: "datetime",
          setExtremes: function() {}
        },
        navigator: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: true,
          buttons: {
            contextButton: {
              text: "",
              menuItems: [
                "printChart",
                "separator",
                "downloadPNG",
                "downloadJPEG",
                "downloadPDF",
                "downloadSVG",
                "separator",
                "downloadCSV",
                "downloadXLS"
              ]
            }
          }
        },
        tooltip: {
          valueDecimals: 2
        },
        rangeSelector: {
          enabled: true,
          inputEnabled: false,
          allButtonsEnabled: true
        },
        scrollbar: {
          enabled: false,
          liveRedraw: false
        },
        credits: {
          enabled: false
        },
        loading: {
          hideDuration: 1000,
          showDuration: 1000
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 350
              },
              chartOptions: {
                rangeSelector: {
                  enabled: false
                }
              }
            }
          ]
        },
        series: []
      },
      sizeChartSeries: [],
      protocolChartOptions: {
        chart: {
          type: "pie",
          spacingLeft: 20,
          spacingRight: 20
        },
        //colors: ["#03A9F4", "#E91E63", "#8bc34a", "#795548", "#ff5722", "#ffc107"],
        title: {
          text: ""
        },
        legend: {
          enabled: false
        },
        accessibility: {
          point: {
            valueSuffix: "%"
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}% ({point.y})"
            },
            showInLegend: true
          }
        },
        exporting: {
          enabled: false,
          buttons: {
            contextButton: {
              text: "",
              menuItems: [
                "printChart",
                "separator",
                "downloadPNG",
                "downloadJPEG",
                "downloadPDF",
                "downloadSVG",
                "separator",
                "downloadCSV",
                "downloadXLS"
              ]
            }
          }
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}% ({point.y})</b>'
        },
        credits: {
          enabled: false
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 550
              },
              chartOptions: {
                plotOptions: {
                  pie: {
                    dataLabels: {
                      enabled: false
                    }
                  }
                }
              }
            }
          ]
        }
      },
      protocolChartSeries: [],
      statsCards: [
        {
          type: "warning",
          icon: "ti-harddrive",
          title: "Metadata",
          value: "",
          footerText: "Since 2009",
          footerIcon: "ti-calendar"
        },
        {
          type: "success",
          icon: "ti-wallet",
          title: "Total Outputs",
          value: "",
          footerText: "",
          footerIcon: "ti-reload"
        },
        {
          type: "danger",
          icon: "ti-pulse",
          title: "New Outputs",
          value: "",
          footerText: "Yesterday",
          footerIcon: "ti-timer"
        },
        {
          type: "info",
          icon: "ti-server",
          title: "Average Output Size",
          value: "",
          footerText: "Yesterday",
          footerIcon: "ti-timer"
        }
      ]
    };
  },
  async mounted() {
    try {
      let frequencyResponse = await axios.get(api.server + "/frequency-analysis");
      if (frequencyResponse.status == 200) {
        this.prepareFrequencyChartData(frequencyResponse.data);
      } else {
        console.log(frequencyResponse.statusText);
      }

      let sizeResponse = await axios.get(api.server + "/size-analysis");
      if (sizeResponse.status == 200) {
        this.prepareSizeChartData(sizeResponse.data);
      } else {
        console.log(sizeResponse.statusText);
      }

      let statsResponse = await axios.get(api.server + "/tx-outputs/stats")
      if (statsResponse.status == 200) {
        this.updateStatsCards(statsResponse.data);
      } else {
        console.log(statsResponse.statusText);
      }

      let protocolResponse = await axios.get(api.server + "/protocol-analysis");
      if (protocolResponse.status == 200) {
        this.prepareProtocolChartData(protocolResponse.data);
      } else {
        console.log(protocolResponse.statusText);
      }

    } catch (err) {
      console.log(err)
    } finally {
      this.timers.charts = new Date();
      var self = this;
      this.refreshHandler = window.setInterval(() => {
        self.updateTimers();
        self.refreshStats();
      }, 30000);
    }
  },
  beforeDestroy() {
    window.clearInterval(this.refreshHandler);
    this.refreshHandler = 0;
  },
  methods: {
    convertToUnixTimestamp(stringDate) {
      return new Date(stringDate).getTime();
    },
    changeScriptChartView() {
      if (this.scriptChartOptions.plotOptions.series.stacking == "normal") {
        this.scriptChartOptions.plotOptions.series.stacking = "percent";
        this.scriptChartOptions.yAxis.labels.formatter = function() { return this.value + "%"; }
      } else {
        this.scriptChartOptions.plotOptions.series.stacking = "normal";
        this.scriptChartOptions.yAxis.labels.formatter = function() { return this.value; }
      }
    },
    async refreshStats() {
      let statsResponse = await axios.get(api.server + "/tx-outputs/stats")
      if (statsResponse.status == 200) {
        this.updateStatsCards(statsResponse.data);
      } else {
        console.log(statsResponse.statusText);
      }
    },
    updateStatsCards(stats) {
      if (!stats || this.statsCards.length != 4) {
        return;
      }

      this.statsCards[0].value = this.formatBytes(stats["total_size"]);
      this.statsCards[1].value = stats["total_outputs"].toLocaleString();
      this.statsCards[1].footerText = "Last output " + moment(new Date(stats["last_output_time"] * 1000)).fromNow();
      this.statsCards[2].value = stats["recent_outputs"];
      this.statsCards[3].value = stats["recent_size"].toLocaleString(undefined, {'minimumFractionDigits':2,'maximumFractionDigits':2}) + " Bytes";

      this.timers.totalOutputs = new Date(stats["last_output_time"] * 1000);
    },
    updateTimers() {
      if (this.timers.totalOutputs) {
        this.statsCards[1].footerText = "Last output " + moment(this.timers.totalOutputs).fromNow();
      }

      if (this.timers.charts) {
        this.chartsFooterText = "Updated " + moment(this.timers.charts).fromNow();
      }
    },
    prepareFrequencyChartData(data) {
      if (!data) {
        return;
      }

      var series = [];

      if ("nulldata" in data[0]) {
        series.push({
          name: "OP_RETURN",
          data: data.map(item => [
            this.convertToUnixTimestamp(item.dataday),
            item.nulldata
          ])
        });
      }

      if ("p2pk" in data[0]) {
        series.push({
          name: "P2PK",
          data: data.map(item => [
            this.convertToUnixTimestamp(item.dataday),
            item.p2pk
          ])
        });
      }

      if ("p2pkh" in data[0]) {
        series.push({
          name: "P2PKH",
          data: data.map(item => [
            this.convertToUnixTimestamp(item.dataday),
            item.p2pkh
          ])
        });
      }

      if ("p2ms" in data[0]) {
        series.push({
          name: "P2MS",
          data: data.map(item => [
            this.convertToUnixTimestamp(item.dataday),
            item.p2ms
          ])
        });
      }

      if ("p2sh" in data[0]) {
        series.push({
          name: "P2SH",
          data: data.map(item => [
            this.convertToUnixTimestamp(item.dataday),
            item.p2sh
          ])
        });
      }

      if ("unknowntype" in data[0]) {
        series.push({
          name: "Unknown",
          data: data.map(item => [
            this.convertToUnixTimestamp(item.dataday),
            item.unknowntype
          ])
        });
      }

      this.scriptChartSeries = series;
    },
    prepareSizeChartData(data) {
      if (!data) {
        return;
      }

      var self = this;

      var series = [
        {
          name: "Average Size",
          data: data.reduce(function(result, item) {
            if (item.outputs > 0) {
              result.push([
                self.convertToUnixTimestamp(item.dataday),
                item.avgsize / item.outputs
              ]);
            }
            return result;
          }, [])
        }
      ];

      this.sizeChartSeries = series;
    },
    prepareProtocolChartData(data) {
      if (!data) {
        return;
      }

      var series = [{
          name: "Protocols",
          colorByPoint: true,
          data: []
        }];

      for (var prop in data[data.length - 1]) {
        if (!(prop == "id" || prop == "dataday")) {
          series[0]["data"].push({
            name: prop,
            y: data[data.length - 1][prop]
          });
        }
      };

      this.protocolChartSeries = series;
    },
    formatBytes(bytes, decimals = 4) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toLocaleString() + ' ' + sizes[i];
    }
  },
  watch: {
    scriptChartSeries(newValue) {
      this.scriptChartOptions.series = newValue;
    },
    sizeChartSeries(newValue) {
      this.sizeChartOptions.series = newValue;
    },
    protocolChartSeries(newValue) {
      this.protocolChartOptions.series = newValue;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
