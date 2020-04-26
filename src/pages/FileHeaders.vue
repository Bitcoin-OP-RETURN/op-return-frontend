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
            <p></p>
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
import Chartist from 'chartist';

export default {
  components: {
    Card,
    StatsCard
  },
  data() {
    return {
      statsCards: [
        {
          type: "warning",
          icon: "ti-server",
          title: "Metadata",
          value: "43GB",
          footerText: "Since 2009",
          footerIcon: "ti-reload"
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
          icon: "ti-twitter-alt",
          title: "Average Output Size",
          value: "38.4 Bytes",
          footerText: "Updated now",
          footerIcon: "ti-reload"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
