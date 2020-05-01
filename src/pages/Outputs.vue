<template>
    <div>
        <card title="Explore the world of OP_RETURN" subTitle="You can search for any transaction, block, or even content">
            <SearchFilter :searchOptions="searchOptions" :isSearching="isSearching" @optionsChanged="optionsChanged" @search="search" />
        </card>
        <card>
            <OutputTable />
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
    methods: {
        optionsChanged(options) {
            this.searchOptions = options.searchOptions;
        },
        async search() {
            this.isSearching = true;

            this.showErrorMessage = false;
            this.searchOptions.query = this.searchOptions.query.trim();

            if (this.isValidTxOrBlockHash(this.searchOptions.query)) {
                if (this.searchOptions.query.startsWith("00000")) {
                    await this.searchTxHash();
                } else {
                    await this.searchBlockHash();
                }
            } else {
                await this.searchContent();
            }

            this.isSearching = false;
        },
        async searchTxHash() {
            var searchParams = new URLSearchParams();
            searchParams.append("hash", this.searchOptions.query);
            searchParams.append("page", this.page);

            // Wait for the first request
            var response = await axios.get(api.server + "/tx-outputs/blockhash?" + searchParams.toString());
            if (response.status == 200) {
                this.searchResults = response.data;
            } else {
                this.showErrorMessage = true;
            }

            // Execute second request in background and update data afterwards
            searchParams.set("page", Number(searchParams.get("page")) + 1);
            var secondResponse = axios.get(api.server + "/tx-outputs/blockhash?" + searchParams.toString())
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
        async searchBlockHash() {

        },
        async searchContent() {

        },
        isEmptyOrSpaces(str) {
            return str === null || str.match(/^ *$/) !== null;
        },
        isValidTxOrBlockHash(str) {
            return str.match(/^[a-f0-9]{64}$/i) !== null && str.length == 64; // https://stackoverflow.com/a/8868839/2102106
        },
        isValidHexString(str) {
            return str.match(/^[A-Fa-f0-9]+/) !== null;
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
