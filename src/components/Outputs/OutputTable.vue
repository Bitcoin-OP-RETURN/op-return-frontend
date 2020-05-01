<template>
    <b-table
        class="table"
        hover
        bordered
        responsive
        stacked="xl"
        :items="data"
        :fields="columns"
    >
    </b-table>
</template>

<script>
export default {
    props: {
        data: Array,
        page: Number,
        totalPages: Number
    },
    data() {
        return {
            columns: [
                {
                    key: "blocktime",
                    label: "Date",
                    sortable: false
                },
                {
                    key: "outasm",
                    label: "Content",
                    sortable: false
                },
                {
                    key: "protocol",
                    label: "Protocol",
                    sortable: false
                },
                {
                    key: "fileheader",
                    label: "File Header",
                    sortable: false
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
.table {
    word-break: break-word;
}
</style>