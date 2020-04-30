import Vue from "vue";
import App from "./App";
import router from "./router/index";
import PaperDashboard from "./plugins/paperDashboard";
import "vue-notifyjs/themes/default.css";
import HighchartsVue from "highcharts-vue";
import { BootstrapVue } from "bootstrap-vue";
import VueAnalytics from 'vue-analytics'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue);
Vue.use(PaperDashboard);
Vue.use(HighchartsVue);

Vue.use(VueAnalytics, {
  id: 'UA-129691270-2'
});

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
