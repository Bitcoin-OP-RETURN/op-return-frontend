<template>
    <div>
        <b-table
            class="table"
            hover
            bordered
            responsive
            stacked="xl"
            :items="data"
            :fields="columns"
            :per-page="itemsPerPage"
            :current-page="currentPage"
        >
        </b-table>
        <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="itemsPerPage"
        >
        </b-pagination>
    </div>
</template>

<script>
import protocols from "@/assets/config/protocols";
import fileheaders from "@/assets/config/fileheaders";

export default {
    props: {
        data: Array,
        page: Number
    },
    data() {
        return {
            currentPage: this.page,
            itemsPerPage: 10,
            totalRows: this.data.length,
            columns: [
                {
                    key: "blocktime",
                    label: "Date",
                    sortable: false,
                    formatter: this.formatDate
                },
                {
                    key: "outasm",
                    label: "Content",
                    sortable: false,
                    formatter: this.formatContent
                },
                {
                    key: "protocol",
                    label: "Protocol",
                    sortable: false,
                    formatter: this.formatProtocol
                },
                {
                    key: "fileheader",
                    label: "File Header",
                    sortable: false,
                    formatter: this.formatFileheader
                }
            ]
        }
    },
    methods: {
        isValidHexString(str) {
            return str.match(/^[A-Fa-f0-9]+/) !== null;
        },
        formatDate(value, key, item) {
            return new Date(value * 1000).toLocaleString();
        },
        formatContent(value, key, item) {
            return item.outtype === "nonstandard" ? item.outasm :
                item.outtype === "nulldata" ?
                    item.protocol === "emptytx" ? item.outasm :
                        this.isValidHexString(item.outasm.split(" ").pop()) ?
                            new Buffer(item.outasm.split(" ").pop(), "hex").toString() : item.outasm
                        : item.outasm;
        },
        formatProtocol(value, key, item) {
            return protocols.protocols.find(prot => prot.value === value).text;
        },
        formatFileheaders(value, key, item) {
            return fileheaders.fileheaders.find(fh => fh.value === value).text;
        }
    },
    watch: {
        currentPage(newValue) {
            this.$emit("newPage", newValue);
        },
        data(newValue) {
            this.totalRows = this.data.length;
        }
    }
}
</script>

<style lang="scss" scoped>
.table {
    word-break: break-word;
}
</style>