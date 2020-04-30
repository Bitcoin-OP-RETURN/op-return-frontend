<template>
    <b-form class="px-1">
        <b-input-group>
            <b-form-input class="search-input border-input" :placeholder="inputPlaceholder"  /> <!-- class="border-input" -->
            <b-input-group-append>
                <b-button class="btn-search no-text-transform" variant="success">Search</b-button>
            </b-input-group-append>
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
    data() {
        return {
            inputPlaceholders: ['Try with a transaction or block hash, or search terms like "bitcoin", "marry me", etc.', 'Try "bitcoin", "marry me", etc.'],
            inputPlaceholder: null,
            minDate: new Date("2009-01-01"),
            maxDate: new Date(),
            encodedInput: true,
            encodingButtonTexts: ["Hex", "Encoded"],
            sortOrderDescending: true,
            sortOrderButtonTexts: ["Ascending", "Descending"],
            protocolSelectionButtonText: "All Protocols",
            protocolSelectionSelected: [],
            protocolSelectionOptions: protocols.protocols,
            fileheaderSelectionButtonText: "All File Headers",
            fileheaderSelectionSelected: [],
            fileheaderSelectionOptions: fileheaders.fileheaders
        }
    },
    mounted() {
        window.addEventListener("resize", this.windowWidthChanged);

        this.windowWidthChanged(); // run once initially
    },
    methods: {
        windowWidthChanged(event) {
            if (document.documentElement.clientWidth < 600) {
                this.inputPlaceholder = this.inputPlaceholders[1];
            } else {
                this.inputPlaceholder = this.inputPlaceholders[0];
            }
        },
        encodingClicked() {
            this.encodedInput = !this.encodedInput;
        },
        sortOrderClicked() {
            this.sortOrderDescending = !this.sortOrderDescending;
        }
    },
    watch: {
        protocolSelectionSelected(newValue) {
            if (newValue.length == 1) {
                this.protocolSelectionButtonText = "1 Protocol";
            } else if (newValue.length > 1) {
                this.protocolSelectionButtonText = newValue.length + " Protocols";
            } else {
                this.protocolSelectionButtonText = "All Protocols";
            }
        },
        fileheaderSelectionSelected(newValue) {
            if (newValue.length == 1) {
                this.fileheaderSelectionButtonText = "1 File Header";
            } else if (newValue.length > 1) {
                this.fileheaderSelectionButtonText = newValue.length + " File Headers";
            } else {
                this.fileheaderSelectionButtonText = "All File Headers";
            }
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