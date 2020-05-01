<template>
    <div>
        <card title="Explore the world of OP_RETURN" subTitle="You can search for any transaction, block, or even content">
            <SearchFilter :searchOptions="searchOptions" :isSearching="isSearching" @optionsChanged="optionsChanged" @search="searchClicked" />
        </card>
        <card>
            <OutputTable :data="searchResults" :page="page" :totalPages="totalPages" />
        </card>
    </div>
</template>

<script>
import { Card } from "@/components/index";
import SearchFilter from "@/components/Outputs/SearchFilter";
import OutputTable from "@/components/Outputs/OutputTable";
import axios from "axios";
import api from "@/assets/config/api";

export default {
    components: {
        Card,
        SearchFilter,
        OutputTable
    },
    data() {
        return {
            isSearching: false,
            searchOptions: {
                query: "",
                minDate: new Date("2009-01-01"),
                maxDate: new Date(),
                encoded: true,
                descending: true,
                protocols: [],
                fileheaders: []
            },
            searchResults: [],
            searchResultsNextPage: [],
            page: 1,
            totalPages: 1,
            showErrorMessage: false,
            errorMessage: "We encountered an error. Please try again."
        }
    },
    async mounted() {
        await this.search();
    },
    methods: {
        optionsChanged(options) {
            this.searchOptions = options.searchOptions;
        },
        async searchClicked() {
            this.page = 1;
            this.totalPages = 1;
            await this.search();
        },
        async search() {
            this.isSearching = true;

            this.showErrorMessage = false;
            this.searchOptions.query = this.searchOptions.query.trim();

            if (this.isValidTxOrBlockHash(this.searchOptions.query)) {
                await this.searchHash();
            } else {
                await this.searchContent();
            }

            this.isSearching = false;
        },
        async searchHash() {
            var searchParams = new URLSearchParams();
            searchParams.append("hash", this.searchOptions.query.toLowerCase());
            searchParams.append("page", this.page);

            var endpoint = this.searchOptions.query.startsWith("00000") ? "blockhash" : "txhash";

            // Wait for the first request
            var response = await axios.get(api.server + "/tx-outputs/" + endpoint + "?" + searchParams.toString());
            if (response.status == 200) {
                this.searchResults = response.data;
            } else {
                this.showErrorMessage = true;
            }

            // Execute second request in background and update data afterwards
            searchParams.set("page", Number(searchParams.get("page")) + 1);
            var secondResponse = axios.get(api.server + "/tx-outputs/" + endpoint + "?" + searchParams.toString())
                .then(response => {
                    if (response.data.length > 0) {
                        this.searchResultsNextPage = response.data;
                    } else {
                        this.searchResultsNextPage = [];
                    }
                })
                .catch(error => {
                    this.searchResultsNextPage = [];
                });
        },
        async searchContent() {
            var query = api.server + "/tx-outputs/search?";
            var nextQuery = query;
            var searchParams = new URLSearchParams();

            if (this.searchOptions.minDate.getTime() !== new Date("2009-01-01").getTime()) {
                searchParams.append("min_time", Math.floor(this.searchOptions.minDate.getTime() / 1000));
            }

            if (new Date(this.searchOptions.maxDate.toISOString().substr(0, 10)).getTime() !== new Date(new Date().toISOString().substr(0, 10)).getTime()) {
                searchParams.append("max_time", Math.floor(this.searchOptions.maxDate.getTime() / 1000));
            }

            if (!this.isEmptyOrSpaces(this.searchOptions.query) && this.searchOptions.query.length >= 3) {
                searchParams.append("search", this.searchOptions.query.trim());
                searchParams.append("format", this.searchOptions.encoded ? "encoded" : "hex");
            }

            if (this.searchOptions.descending) {
                searchParams.append("sort", "desc");
            } else {
                searchParams.append("sort", "asc");
            }

            if (this.page > 0) {
                searchParams.append("page", this.page);
            }

            query += searchParams.toString();
            searchParams.set("page", Number(searchParams.get("page")) + 1);
            nextQuery += searchParams.toString();

            if (this.searchOptions.protocols.length > 0) {
                var appendPr = "&protocol=" + this.searchOptions.protocols.join(",");
                query += appendPr;
                nextQuery += appendPr;
            }

            if (this.searchOptions.fileheaders.length > 0) {
                var appendFh = "&fileheader=" + this.searchOptions.fileheaders.join(",");
                query += appendFh;
                nextQuery += appendFh;
            }

            // Wait for the first request
            var response = await axios.get(query);
            if (response.status == 200) {
                this.searchResults = response.data;
            } else {
                this.showErrorMessage = true;
            }

            // Execute second request in background and update data afterwards
            var secondResponse = axios.get(nextQuery)
                .then(response => {
                    if (response.data.length > 0) {
                        this.searchResultsNextPage = response.data;
                    } else {
                        this.searchResultsNextPage = [];
                    }
                })
                .catch(error => {
                    this.searchResultsNextPage = [];
                });
        },
        isEmptyOrSpaces(str) {
            return str === null || str.match(/^ *$/) !== null;
        },
        isValidTxOrBlockHash(str) {
            return str.match(/^[A-Fa-f0-9]{64}$/i) !== null && str.length == 64; // https://stackoverflow.com/a/8868839/2102106
        },
        isValidHexString(str) {
            return str.match(/^[A-Fa-f0-9]+/) !== null;
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
