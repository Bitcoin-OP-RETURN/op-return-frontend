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
            :busy="isSearching"
        >
            <template v-slot:table-busy>
                <div class="text-center text-danger my-2">
                    <b-spinner type="grow" class="align-middle"></b-spinner>
                    <strong class="pl-2">Loading...</strong>
                </div>
            </template>
        </b-table>
        <b-pagination
            :pills="true"
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="itemsPerPage"
            align="center"
        >
            <template v-slot:first-text><i class="fas fa-angle-double-left text-dark"></i></template>
            <template v-slot:prev-text><i class="fas fa-angle-left text-dark"></i></template>
            <template v-slot:next-text><i class="fas fa-angle-right text-dark"></i></template>
            <template v-slot:last-text><i class="fas fa-angle-double-right text-dark"></i></template>
            <template v-slot:ellipsis-text><i class="fas fa-ellipsis-h text-dark"></i></template>
            <template v-slot:page="{ page, active }">
                <b v-if="active">{{ page }}</b>
                <span v-else>{{ page }}</span>
            </template>
        </b-pagination>
    </div>
</template>

<script>
import protocols from "@/assets/config/protocols";
import fileheaders from "@/assets/config/fileheaders";

export default {
    props: {
        data: Array,
        page: Number,
        itemsPerPage: Number,
        isSearching: Boolean
    },
    data() {
        return {
            currentPage: this.page,
            localItemsPerPage: this.itemsPerPage,
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
    mounted() {
        window.addEventListener("resize", this.windowWidthChanged);
        this.windowWidthChanged(); // run once initially
    },
    methods: {
        windowWidthChanged(event) {
            if (document.documentElement.clientWidth < 1200) {
                this.localItemsPerPage = 5;
            } else {
                this.localItemsPerPage = 10;
            }
        },
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
        localItemsPerPage(newValue) {
            this.$emit("itemsPerPageChanged", newValue);
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