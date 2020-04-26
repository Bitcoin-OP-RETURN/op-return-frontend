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
        <card title="Standard scripts" subTitle="Usage of scripts used on the entire Bitcoin blockchain">
          <div class="card-body">
            <highcharts
              v-if="scriptChartSeries.length > 0"
              :options="scriptChartOptions"
              :constructor-type="'stockChart'"
            ></highcharts>
          </div>
          <hr>
          <div class="stats">
            <i class="ti-reload"></i> Updated just now
          </div>
        </card>
      </div>

      <div class="col-6">
        <card title="OP_RETURN Protocols" subTitle="Publicly known protocols using the operator">
          <div class="card-body">
            <p></p>
          </div>
          <hr>
          <div class="stats">
            <i class="ti-reload"></i> Updated just now
          </div>
        </card>
      </div>

      <div class="col-6">
        <card title="OP_RETURN Output Size" subTitle="The average size of outputs using the operator">
          <div class="card-body">
            <p></p>
          </div>
          <hr>
          <div class="stats">
            <i class="ti-reload"></i> Updated just now
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
      scriptChartOptions: {
        chart: {
          type: "area",
          height: 500,
          spacingLeft: 20,
          spacingRight: 20,
          zoomType: "x"
        },
        yAxis: {
          allowDecimals: false,
          labels: {
            formatter: function() {
              return this.value + "%";
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
            stacking: "normal" // "normal" for normal stacking
          }
        },
        legend: {
          enabled: true,
          floating: false
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
          inputEnabled: true,
          allButtonsEnabled: true
        },
        credits: {
          enabled: false
        },
        series: []
      },
      scriptChartSeries: [],
      statsCards: [
        {
          type: "warning",
          icon: "ti-harddrive",
          title: "Metadata",
          value: "43GB",
          footerText: "Since 2009",
          footerIcon: "ti-calendar"
        },
        {
          type: "success",
          icon: "ti-wallet",
          title: "Total Outputs",
          value: "40.000.000",
          footerText: "Since 2009",
          footerIcon: "ti-calendar"
        },
        {
          type: "danger",
          icon: "ti-pulse",
          title: "New Outputs",
          value: "1337",
          footerText: "Today",
          footerIcon: "ti-timer"
        },
        {
          type: "info",
          icon: "ti-server",
          title: "Average Output Size",
          value: "38.4 Bytes",
          footerText: "Updated now",
          footerIcon: "ti-reload"
        }
      ]
    };
  },
  async mounted() {
    try {
      let response = await axios.get(api.server + "/frequency-analysis");
      if (response.status == 200) {
        this.prepareData(response.data);
      }
    } catch (err) {
      console.log(err)
    }
  },
  methods: {
    prepareData(data) {
      if (!data) {
        return;
      }

      var series = [];

      if ("nulldata" in data[0]) {
        series.push({
          name: "Nulldata (OP_RETURN)",
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
    convertToUnixTimestamp(stringDate) {
      return new Date(stringDate).getTime();
    }
  },
  watch: {
    scriptChartSeries(newValue) {
      this.scriptChartOptions.series = JSON.parse(JSON.stringify(newValue));
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
