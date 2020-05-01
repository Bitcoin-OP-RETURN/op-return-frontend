<template>
    <b-form class="px-1">
        <b-input-group>
            <b-form-input
                :state="inputState"
                :placeholder="inputPlaceholder"
                v-model="inputText"
                class="search-input border-input"
            />
            <b-input-group-append>
                <b-button
                    class="btn-search no-text-transform"
                    variant="success"
                    @click="searchClicked"
                    :disabled="searchDisabled"
                >
                    <b-spinner small v-if="this.isSearching"></b-spinner>
                    Search
                </b-button>
            </b-input-group-append>
            <b-form-invalid-feedback id="input-feedback">
                {{ inputMessage }}
            </b-form-invalid-feedback>
        </b-input-group>
        <b-button-group class="btn-group">
            <b-button
                class="btn no-text-transform"
                variant="outline-primary"
                v-b-modal.modal-min-date
            >
                {{ minDate.toLocaleDateString() }}

                <b-modal id="modal-min-date" centered ok-only size="sm" title="Choose a starting date">
                    <date-picker
                        class="date-picker"
                        v-model="minDate"
                        type="date"
                        valueType="date"
                        inline
                        :default-value="new Date('2009-01-01')"
                        :partial-update="true"
                        :show-week-number="false"
                        :confirm="false"
                        :clearable="false"
                    ></date-picker>
                </b-modal>
            </b-button>

            <b-button
                class="btn no-text-transform"
                variant="outline-primary"
                v-b-modal.modal-max-date
            >
                {{ maxDate.toLocaleDateString() }}

                <b-modal id="modal-max-date" centered ok-only size="sm" title="Choose an ending date">
                    <date-picker
                        class="date-picker"
                        v-model="maxDate"
                        type="date"
                        valueType="date"
                        inline
                        :default-value="new Date()"
                        :partial-update="true"
                        :show-week-number="false"
                        :confirm="false"
                        :clearable="false"
                    ></date-picker>
                </b-modal>
            </b-button>

            <b-button
                class="btn no-text-transform"
                variant="outline-primary"
                @click="encodingClicked"
            >
                {{ encodingButtonTexts[encodedInput ? 1 : 0] }}
            </b-button>

            <b-button
                class="btn no-text-transform"
                variant="outline-primary"
                @click="sortOrderClicked"
            >
                {{ sortOrderButtonTexts[sortOrderDescending ? 1 : 0] }}
            </b-button>

            <b-button
                class="btn no-text-transform"
                variant="outline-primary"
                v-b-modal.modal-protocols
            >
                {{ protocolSelectionButtonText }}

                <b-modal id="modal-protocols" centered ok-only size="sm" scrollable title="Select Protocols">
                    <b-form-checkbox
                        v-for="protocol in protocolSelectionOptions"
                        v-model="protocolSelectionSelected"
                        :key="protocol.value"
                        :value="protocol.value"

                    >
                        {{ protocol.text }}
                    </b-form-checkbox>
                </b-modal>
            </b-button>

            <b-button
                class="btn no-text-transform"
                variant="outline-primary"
                v-b-modal.modal-fileheaders
            >
                {{ fileheaderSelectionButtonText }}

                <b-modal id="modal-fileheaders" centered ok-only size="sm" scrollable title="Select File Headers">
                    <b-form-checkbox
                        v-for="fileheader in fileheaderSelectionOptions"
                        v-model="fileheaderSelectionSelected"
                        :key="fileheader.value"
                        :value="fileheader.value"

                    >
                        {{ fileheader.text }}
                    </b-form-checkbox>
                </b-modal>
            </b-button>
        </b-button-group>
    </b-form>
</template>

<script>
import moment from "moment";
import DatePicker from "vue2-datepicker";
import 'vue2-datepicker/index.css';
import protocols from "@/assets/config/protocols";
import fileheaders from "@/assets/config/fileheaders";

export default {
    components: {
        DatePicker
    },
    props: {
        isSearching: Boolean,
        searchOptions: {
            query: String,
            minDate: Date,
            maxDate: Date,
            encoded: Boolean,
            descending: Boolean,
            protocols: Array,
            fileheaders: Array
        }
    },
    data() {
        return {
            inputPlaceholders: ['Try with a transaction or block hash, or search terms like "bitcoin", "marry me", etc.', 'Try "bitcoin", "marry me", etc.'],
            inputPlaceholder: null,
            inputText: this.searchOptions.query,
            inputState: null,
            inputMessage: "",
            searchDisabled: false,
            minDate: this.searchOptions.minDate,
            maxDate: this.searchOptions.maxDate,
            encodedInput: this.searchOptions.encoded,
            encodingButtonTexts: ["Hex", "Encoded"],
            sortOrderDescending: this.searchOptions.descending,
            sortOrderButtonTexts: ["Ascending", "Descending"],
            protocolSelectionButtonText: "All Protocols",
            protocolSelectionSelected: this.searchOptions.protocols,
            protocolSelectionOptions: protocols.protocols,
            fileheaderSelectionButtonText: "All File Headers",
            fileheaderSelectionSelected: this.searchOptions.fileheaders,
            fileheaderSelectionOptions: fileheaders.fileheaders,
        }
    },
    mounted() {
        window.addEventListener("resize", this.windowWidthChanged);
        this.windowWidthChanged(); // run once initially

        this.changeProtocolSelectionText(this.protocolSelectionSelected);
        this.changeFileHeaderSelectionText(this.fileheaderSelectionSelected);
    },
    methods: {
        windowWidthChanged(event) {
            if (document.documentElement.clientWidth < 600) {
                this.inputPlaceholder = this.inputPlaceholders[1];
            } else {
                this.inputPlaceholder = this.inputPlaceholders[0];
            }
        },
        evaluateInput() {
            if (this.inputText.length > 0 && this.inputText.length < 3) {
                this.inputState = false;
                this.searchDisabled = true;
                this.inputMessage = "Enter at least 3 characters.";
            } else if (this.inputText.length > 0 && !this.encodedInput && !this.inputText.match(/^[a-fA-F0-9]+$/)) {
                this.inputState = false;
                this.searchDisabled = true;
                this.inputMessage = "Enter a hexadecimal string or switch to the encoded format."
            } else {
                this.inputState = null;
                this.searchDisabled = false;
                this.inputMessage = "";
            }
        },
        encodingClicked() {
            this.encodedInput = !this.encodedInput;
        },
        sortOrderClicked() {
            this.sortOrderDescending = !this.sortOrderDescending;
        },
        changeProtocolSelectionText(selected) {
            if (selected.length == 1) {
                this.protocolSelectionButtonText = "1 Protocol";
            } else if (selected.length > 1) {
                this.protocolSelectionButtonText = selected.length + " Protocols";
            } else {
                this.protocolSelectionButtonText = "All Protocols";
            }
        },
        changeFileHeaderSelectionText(selected) {
            if (selected.length == 1) {
                this.fileheaderSelectionButtonText = "1 File Header";
            } else if (selected.length > 1) {
                this.fileheaderSelectionButtonText = selected.length + " File Headers";
            } else {
                this.fileheaderSelectionButtonText = "All File Headers";
            }
        },
        emitSearchOptions() {
            this.evaluateInput();

            this.$emit("optionsChanged", {
                searchOptions: {
                    query: this.inputText,
                    minDate: this.minDate,
                    maxDate: this.maxDate,
                    encoded: this.encodedInput,
                    descending: this.sortOrderDescending,
                    protocols: this.protocolSelectionSelected,
                    fileheaders: this.fileheaderSelectionSelected
                }
            })
        },
        searchClicked() {
            this.$emit("search");
        }
    },
    watch: {
        inputText(newValue) {
            this.evaluateInput();
            this.emitSearchOptions();
        },
        minDate() {
            this.emitSearchOptions();
        },
        maxDate() {
            this.emitSearchOptions();
        },
        encodedInput() {
            this.emitSearchOptions();
        },
        sortOrderDescending() {
            this.emitSearchOptions();
        },
        protocolSelectionSelected(newValue) {
            this.changeProtocolSelectionText(newValue);
            this.emitSearchOptions();
        },
        fileheaderSelectionSelected(newValue) {
            this.changeFileHeaderSelectionText(newValue);
            this.emitSearchOptions();
        }
    }
}
</script>

<style lang="scss" scoped>
.no-text-transform {
    text-transform: none;
}

.btn-search {
    font-size: 13px;
    border-radius: 0px 5px 5px 0px !important;
}

.search-input {
    height: auto;
}

.btn-group {
    display: flex;
    margin-bottom: 10px;

    .btn {
        flex: 1;
        font-size: 13px;
    }
}

@media only screen and (max-width: 900px) {
  .btn-group {
    display: block;

    .btn {
        display: block;
        float: none;
        width: 100%;
        border-radius: 0px;
        margin-bottom: 5px;
    }
  }
}

.date-picker {
    left: 50%;
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);
}
</style>