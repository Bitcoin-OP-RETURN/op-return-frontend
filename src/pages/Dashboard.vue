<template>
  <div>

    <StatisticsCards />

    <div class="row">
      <div class="col-12">
        <FrequencyChart />
      </div>
    </div>

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
              ref="scriptChart"
            ></highcharts>
          </div>
        </card>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 col-12">
        <card>
          <template slot="header">
            <div class="row">
              <div class="col-lg-9 col-12">
                <h4 class="card-title">OP_RETURN Protocols</h4>
                <p class="card-category">Publicly known protocols using the operator</p>
              </div>
              <div class="col-lg-3 col-12">
                <div class="date-picker">
                  <!--Element can be added to the top right corner here-->
                </div>
              </div>
            </div>
          </template>

          <div class="card-body">
            <highcharts
              v-if="protocolChartSeries.length > 0"
              :options="protocolChartOptions"
              ref="protocolChart"
            ></highcharts>
          </div>
          <hr>
          <div class="stats date-picker">
            <date-picker
              v-model="datePickerRange"
              type="date"
              valueType="date"
              format="YYYY-MM-DD"
              range
              range-separator=" to "
              :show-week-number="false"
              :confirm="false"
              :clearable="false"
              :shortcuts="datePickerShortcuts"
              @input="updateProtocolChart"
            ></date-picker>
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
              ref="sizeChart"
            ></highcharts>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import StatisticsCards from "@/components/Dashboard/StatisticsCards";
import FrequencyChart from "@/components/Dashboard/FrequencyChart";

import { Card, StatsCard } from "@/components/index";
import Highcharts from "highcharts";
import stockInit from "highcharts/modules/stock";
import exporting from "highcharts/modules/exporting";
import exportData from "highcharts/modules/export-data";
import axios from "axios";
import api from "../assets/config/api.js";
import moment from "moment";
import DatePicker from "vue2-datepicker";
import 'vue2-datepicker/index.css';

stockInit(Highcharts);
exporting(Highcharts);
exportData(Highcharts);

export default {
  components: {
    StatisticsCards,
    FrequencyChart,
    Card,
    StatsCard,
    DatePicker
  },
  data() {
    return {
      protocolChartRawData: null,
      datePickerRange: [
        moment().subtract(7, 'days').toDate(),
        new Date()
      ],
      datePickerShortcuts:
      [
        {
          text: "Yesterday",
          onClick: () => {
            return [moment().subtract(1, 'days').toDate(), moment().toDate()];
          }
        },
        {
          text: "Last Week",
          onClick: () => {
            return [moment().subtract(7, 'days').toDate(), moment().toDate()];
          }
        },
        {
          text: "Last Month",
          onClick: () => {
            return [moment().subtract(1, 'months').toDate(), moment().toDate()];
          }
        },
        {
          text: "Last Year",
          onClick: () => {
            return [moment().subtract(1, 'years').toDate(), moment().toDate()];
          }
        },
        {
          text: "Year To Date",
          onClick: () => {
            return [moment().startOf('year').toDate(), moment().toDate()];
          }
        },
        {
          text: "All",
          onClick: () => {
            return [moment("2009-01-01").toDate(), moment().toDate()];
          }
        }
      ],
      refreshHandler: 0,
      timers: {
        totalOutputs: null,
        charts: null
      },
      chartsFooterText: "Updated just now",
      scriptChartOptions: {
        chart: {
          type: "area",
          //height: 400,
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
          //height: 400,
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
          spacingRight: 20,
          events: {
            redraw: function() {
              // do something on redraw
            }
          }
        },
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
              format: "<b>{point.name}</b>: {point.percentage:.1f}% ({point.y:,.0f})"
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
          icon: "fas fa-hdd",
          title: "Metadata",
          value: "",
          footerText: "Since 2009",
          footerIcon: "far fa-calendar-alt"
        },
        {
          type: "success",
          icon: "fas fa-database",
          title: "Total Outputs",
          value: "",
          footerText: "",
          footerIcon: "fas fa-sync-alt"
        },
        {
          type: "danger",
          icon: "fas fa-plus-square",
          title: "New Outputs",
          value: "",
          footerText: "Yesterday",
          footerIcon: "far fa-clock"
        },
        {
          type: "info",
          icon: "fas fa-chart-line",
          title: "Average Output Size",
          value: "",
          footerText: "Yesterday",
          footerIcon: "far fa-clock"
        }
      ]
    };
  },
  async mounted() {
    var self = this;

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
        self.protocolChartRawData = protocolResponse.data;
        this.prepareProtocolChartData(this.protocolChartRawData);
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

      // add all props to the series with an initial value of 0
      for (var propName in data[0]) {
        if (!(propName == "id" || propName == "dataday")) {
          series[0]["data"].push({
            name: propName,
            y: 0
          });
        }
      }

      data.forEach(day => {
        var dataday = moment(day["dataday"]);
        if (dataday.isSameOrAfter(moment(this.datePickerRange[0]), 'day') && dataday.isSameOrBefore(moment(this.datePickerRange[1]), 'day')) {
          for (var propName in day) {
            if (!(propName == "id" || propName == "dataday")) {
              series[0]["data"].find(obj => { return obj.name == propName }).y += day[propName];
            }
          }
        }
      });

      this.protocolChartSeries = series;
    },
    updateProtocolChart(newDateRange) {
      if (newDateRange.length !== 2) {
        return;
      }

      this.prepareProtocolChartData(this.protocolChartRawData);
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

      if (this.$refs.scriptChart) {
        this.$refs.scriptChart.chart.update(this.sizeChartOptions);
      }
    },
    sizeChartSeries(newValue) {
      this.sizeChartOptions.series = newValue;

      if (this.$refs.sizeChart) {
        this.$refs.sizeChart.chart.update(this.sizeChartOptions);
      }
    },
    protocolChartSeries(newValue) {
      this.protocolChartOptions.series = newValue;

      if (this.$refs.protocolChart) {
        this.$refs.protocolChart.chart.update(this.protocolChartOptions);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.date-picker * {
  width: 100%;
}
</style>
