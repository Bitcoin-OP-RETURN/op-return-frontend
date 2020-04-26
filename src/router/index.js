import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";
import VueApexCharts from "vue-apexcharts";

Vue.component("apexchart", VueApexCharts);
Vue.use(VueRouter);

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: "active"
});

export default router;
