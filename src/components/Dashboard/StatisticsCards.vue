<template>
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
</template>

<script>
import { StatsCard } from "@/components/index";
import axios from "axios";
import api from "@/assets/config/api.js";
import moment from "moment";

export default {
    components: {
        StatsCard
    },
    data() {
        return {
            timers: {
                totalOutputs: null
            },
            refreshHandler: 0,
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
        }
    },
    async mounted() {
        var self = this;

        try {
            let statsResponse = await axios.get(api.server + "/tx-outputs/stats")
            if (statsResponse.status == 200) {
                this.updateStatsCards(statsResponse.data);
            } else {
                console.log(statsResponse.statusText);
            }
        } catch (err) {
            console.log(err)
        } finally {
            var self = this;
            this.refreshHandler = window.setInterval(() => {
                self.refreshStats();
            }, 30000);
        }
    },
    beforeDestroy() {
        window.clearInterval(this.refreshHandler);
        this.refreshHandler = 0;
    },
    methods: {
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
        formatBytes(bytes, decimals = 4) {
            if (bytes === 0) return '0 Bytes';

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toLocaleString() + ' ' + sizes[i];
        }
    }
}
</script>

<style lang="scss" scoped>
</style>