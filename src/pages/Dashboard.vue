<template>
  <div>

    <StatisticsCards />

    <div class="row">
      <div class="col-12">
        <FrequencyChart />
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 col-12">
        <ProtocolChart />
      </div>
      <div class="col-md-6 col-12">
        <SizeChart />
      </div>
    </div>

  </div>
</template>

<script>
import "@/assets/sass/paper-dashboard.scss";
import StatisticsCards from "@/components/Dashboard/StatisticsCards";
import FrequencyChart from "@/components/Dashboard/FrequencyChart";
import ProtocolChart from "@/components/Dashboard/ProtocolChart";
import SizeChart from "@/components/Dashboard/SizeChart";

export default {
  components: {
    StatisticsCards,
    FrequencyChart,
    ProtocolChart,
    SizeChart
  },
  data() {
    return {

    };
  }
};
</script>

<style lang="scss" scoped>
</style>
