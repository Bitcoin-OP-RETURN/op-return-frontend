<template>
    <card title="OP_RETURN Protocols" subTitle="Publicly known protocols using the operator">
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
                ref="datepicker"
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
                @focus="showDatePicker"
            ></date-picker>
        </div>
    </card>
</template>

<script>
import { Card } from "@/components/index";
import Highcharts from "highcharts";
import axios from "axios";
import api from "@/assets/config/api.js";
import moment from "moment";
import DatePicker from "vue2-datepicker";
import 'vue2-datepicker/index.css';

export default {
    components: {
        Card,
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
            protocolChartSeries: []
        }
    },
    async mounted() {
        var self = this;

        try {
            let protocolResponse = await axios.get(api.server + "/protocol-analysis");
            if (protocolResponse.status == 200) {
                self.protocolChartRawData = protocolResponse.data;
                this.prepareProtocolChartData(this.protocolChartRawData);
            } else {
                console.log(protocolResponse.statusText);
            }
        } catch (err) {
            console.log(err)
        }
    },
    methods: {
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
        showDatePicker() {
            this.$refs.datepicker.blur(); // don't show keyboard on mobile (https://stackoverflow.com/a/8075384/2102106)
        }
    },
    watch: {
        protocolChartSeries(newValue) {
            this.protocolChartOptions.series = newValue;

            if (this.$refs.protocolChart) {
                this.$refs.protocolChart.chart.update(this.protocolChartOptions);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.date-picker * {
  width: 100%;
}
</style>