<template>
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
</template>

<script>
import { Card } from "@/components/index";
import Highcharts from "highcharts";
import stockInit from "highcharts/modules/stock";
import exporting from "highcharts/modules/exporting";
import exportData from "highcharts/modules/export-data";
import axios from "axios";
import api from "@/assets/config/api.js";
import moment from "moment";

stockInit(Highcharts);
exporting(Highcharts);
exportData(Highcharts);

export default {
    components: {
        Card
    },
    data() {
        return {
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
                            return this.value.toLocaleString();
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
                            el.series.name + ": " + Math.ceil(el.y).toLocaleString() + " (" + (el.y > 0 ? ((el.y / sum) * 100).toFixed(2) : "0") + "%)")
                        );

                        return [moment(this.x).format("dddd, MMM D, YYYY").toString()].concat(labels);
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
            scriptChartSeries: []
        }
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
        } catch (err) {
            console.log(err)
        }
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
        }
    },
    watch: {
        scriptChartSeries(newValue) {
            this.scriptChartOptions.series = newValue;

            if (this.$refs.scriptChart) {
                this.$refs.scriptChart.chart.update(this.sizeChartOptions);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
</style>