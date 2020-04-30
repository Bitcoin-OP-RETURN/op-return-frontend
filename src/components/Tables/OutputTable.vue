<template>
    <div>
        <vue-good-table
            mode="remote"
            @on-page-change="onPageChange"
            @on-per-page-change="onPerPageChange"
            :isLoading="isLoading"
            :totalRows="totalRecords"
            :columns="columns"
            :rows="rows"
            :line-numbers="true"
            :pagination-options="{
                enabled: true,
                mode: 'pages',
                perPage: 10,
                perPageDropdown: [10],
                position: 'bottom',
            }"
        />
  </div>
</template>

<script>
import 'vue-good-table/dist/vue-good-table.css'
import { VueGoodTable } from 'vue-good-table';
import api from "@/assets/config/api";
import axios from "axios";

export default {
    components: {
        VueGoodTable
    },
    data() {
        return {
            searchOptions: {
                searchString: "",
                searchType: "content", // 'txhash', 'blockhash', change when input changes
                searchFormat: "encoded", // 'hex'
                ascending: false,
                startDate: new Date("2009-01-01"),
                endDate: new Date().setHours(0, 0, 0),
                protocols: [],
                fileHeaders: []
            },
            isLoading: false,
            totalRecords: 0,
            columns: [
                {
                    label: "Date",
                    field: "blocktime",
                    type: "date",
                    width: "10px",
                    dateInputFormat: "t",
                    dateOutputFormat: "dd/MM/yyyy, HH:mm:ss",
                    sortable: false,
                    html: false
                },
                {
                    label: "Content",
                    field: "outasm",
                    type: "text",
                    width: "10px",
                    sortable: false,
                    html: true,
                    formatFn: this.formatOutAsm
                },
                {
                    label: "Protocol",
                    field: "protocol",
                    type: "text",
                    sortable: false,
                    html: false,
                    formatFn: this.formatProtocol
                },
                {
                    label: "File Header",
                    field: "fileheader",
                    type: "text",
                    sortable: false,
                    html: false,
                    formatFn: this.formatFileHeader
                }
            ],
            rows: [],
            serverParams: {
                page: 1,
                perPage: 10
            }
        }
    },
    mounted() {
        this.loadItems();
    },
    methods: {
        formatOutAsm: function(value) {
            // convert hex to readable format
            var output = "";
            value.match(/(.{1,32})/g).forEach(item => {
                output += item + "<br>";
            });
            console.log(output);
            return output;
        },
        formatProtocol: function(value) {
            // convert protocol string to prettier string with some dictionary
            return value;
        },
        formatFileHeader: function(value) {
            // convert file header string to prettier representation
            return value;
        },
        updateParams(newProps) {
            this.serverParams = Object.assign({}, this.serverParams, newProps);
        },
        onPageChange(params) {
            // params.currentPage - current page that pagination is at
            // params.prevPage - previous page
            // params.currentPerPage - number of items per page
            // params.total - total number of items in the table
            this.updateParams({ page: params.currentPage });
            this.loadItems();
        },
        onPerPageChange(params) {
            // params.currentPage - current page that pagination is at
            // params.currentPerPage - number of items per page
            // params.total - total number of items in the table
            this.updateParams({ perPage: params.currentPerPage });
            this.loadItems();
        },
        async loadItems(options) {
            this.isLoading = true;

            var query = api.server + "/tx-outputs/search?"

            var response = await axios.get(query);
            if (response.status == 200) {
                this.totalRecords = response.data.length;
                this.rows = response.data;
            } else {
                console.log(response.statusText);
            }

            this.isLoading = false;
        }
    }
}
</script>

<style lang="scss" scoped>

</style>