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
                minDate: new Date("2009-01-01"),
                maxDate: new Date(),
                encoded: true,
                descending: true,
                protocols: [],
                fileheaders: []
            }
        }
    },
    methods: {
        optionsChanged(options) {
            this.searchOptions = options;
        },
        search() {
            this.isSearching = true;



            this.isSearching = false;
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
