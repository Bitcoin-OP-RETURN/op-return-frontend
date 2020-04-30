<template>
    <div>
        <card title="Explore the world of OP_RETURN" subTitle="You can search for any transaction, block, or even content">
            <SearchFilter />
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

        }
    }
}
</script>

<style lang="scss" scoped>
</style>
