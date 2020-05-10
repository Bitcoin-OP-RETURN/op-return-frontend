<template>
    <card title="OP_RETURN Protocols" subTitle="Publicly known protocols using the operator">
        <div class="card-body">
            <highcharts
                v-if="protocolChartSeries.length > 0"
                :options="protocolChartOptions"
                :constructor-type="'stockChart'"
                ref="protocolChart"
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
import protocols from "@/assets/config/protocols.js";
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
            protocolChartOptions: {
                chart: {
                    type: "line",
                    zoomType: "x",
                    spacingLeft: 20,
                    spacingRight: 20
                },
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
                        }
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
            protocolChartSeries: []
        }
    },
    async mounted() {
        var self = this;

        try {
            let protocolResponse = await axios.get(api.server + "/protocol-analysis");
            if (protocolResponse.status == 200) {
                this.prepareProtocolChartData(protocolResponse.data);
            } else {
                console.log(protocolResponse.statusText);
            }
        } catch (err) {
            console.log(err)
        }
    },
    methods: {
        convertToUnixTimestamp(stringDate, minDate) {
            return new Date(stringDate).getTime();
        },
        changeProtocolChartView() {
            if (this.protocolChartOptions.plotOptions.series.stacking == "normal") {
                this.protocolChartOptions.plotOptions.series.stacking = "percent";
                this.protocolChartOptions.yAxis.labels.formatter = function() { return this.value + "%"; }
            } else {
                this.protocolChartOptions.plotOptions.series.stacking = "normal";
                this.protocolChartOptions.yAxis.labels.formatter = function() { return this.value; }
            }
        },
        prepareProtocolChartData(data) {
            if (!data) {
                return;
            }

            var series = [];

            var initialProtocol = "veriblock";

            for (var propName in data[0]) {
                if (!(propName == "id" || propName == "dataday")) {
                    var displayName = protocols.protocols.find(x => x.value === propName);
                    if (displayName && displayName.text) {
                        series.push({
                                name: displayName.text,
                                visible: propName == initialProtocol,
                                data: data
                                    .filter(
                                        item => item[propName] > 0
                                    )
                                    .map(item => {
                                        return [
                                            this.convertToUnixTimestamp(item.dataday),
                                            item[propName]
                                        ]
                                    })
                            })
                    }
                }
            }

            this.protocolChartSeries = series;
        }
    },
    watch: {
        protocolChartSeries(newValue) {
            this.protocolChartOptions.series = newValue;

            if (this.$refs.protocolChart) {
                this.$refs.protocolChart.chart.update(this.protocolhartOptions);
            }
        }
    }
}
</script>

<style>

</style>