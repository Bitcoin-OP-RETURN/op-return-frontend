import DashboardLayout from "@/layout/dashboard/DashboardLayout.vue";
// GeneralViews
import NotFound from "@/pages/NotFoundPage.vue";

// Admin pages
import Dashboard from "@/pages/Dashboard.vue";
import Outputs from "@/pages/Outputs.vue";
import FileHeaders from "@/pages/FileHeaders.vue";
import WordCloud from "@/pages/WordCloud.vue";
import About from "@/pages/About.vue";

const routes = [
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: Dashboard
      },
      {
        path: "outputs",
        name: "outputs",
        component: Outputs
      },
      {
        path: "fileheaders",
        name: "fileheaders",
        component: FileHeaders
      },
      {
        path: "wordcloud",
        name: "wordcloud",
        component: WordCloud
      },
      {
        path: "about",
        name: "about",
        component: About
      }
    ]
  },
  { path: "*", component: NotFound }
];

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes;
