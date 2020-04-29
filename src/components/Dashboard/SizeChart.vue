<template>
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
            sizeChartSeries: []
        }
    },
    async mounted() {
        var self = this;

        try {
            let sizeResponse = await axios.get(api.server + "/size-analysis");
            if (sizeResponse.status == 200) {
                this.prepareSizeChartData(sizeResponse.data);
            } else {
                console.log(sizeResponse.statusText);
            }
        } catch (err) {
            console.log(err)
        }
    },
    methods: {
        convertToUnixTimestamp(stringDate) {
            return new Date(stringDate).getTime();
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
        }
    },
    watch: {
        sizeChartSeries(newValue) {
            this.sizeChartOptions.series = newValue;

            if (this.$refs.sizeChart) {
                this.$refs.sizeChart.chart.update(this.sizeChartOptions);
            }
        }
    }
}
</script>

<style lang="scss" scoped>

</style>