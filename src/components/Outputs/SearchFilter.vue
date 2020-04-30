<template>
    <b-form>
        <b-input-group>
            <b-form-input class="search-input border-input" :placeholder="inputPlaceholder"  /> <!-- class="border-input" -->
            <b-input-group-append>
                <b-button class="btn-search no-text-transform" variant="success">Search</b-button>
            </b-input-group-append>
        </b-input-group>
        <b-button-group class="btn-group">
            <b-button class="btn no-text-transform" variant="outline-primary">{{ minDate.format("YYYY-MM-DD") }}</b-button>
            <b-button class="btn no-text-transform" variant="outline-primary">{{ maxDate.format("YYYY-MM-DD") }}</b-button>
            <b-button class="btn no-text-transform" variant="outline-primary">{{ encodingButtonTexts[encodedInput ? 1 : 0] }}</b-button>
            <b-button class="btn no-text-transform" variant="outline-primary">{{ sortOrderButtonTexts[sortOrderDescending ? 1 : 0] }}</b-button>
            <b-button class="btn no-text-transform" variant="outline-primary">{{ protocolSelections }}</b-button>
            <b-button class="btn no-text-transform" variant="outline-primary">{{ fileheaderSelections }}</b-button>
        </b-button-group>
    </b-form>
</template>

<script>
import moment from "moment";

export default {
    components: {

    },
    data() {
        return {
            inputPlaceholders: ['Try with a transaction hash, or search terms like "bitcoin", "marry me", etc.', 'Try "bitcoin", "marry me", etc.'],
            inputPlaceholder: null,
            minDate: moment("2009-01-01"),
            maxDate: moment(),
            encodedInput: true,
            encodingButtonTexts: ["Hex", "Encoded"],
            sortOrderDescending: true,
            sortOrderButtonTexts: ["Ascending", "Descending"],
            protocolSelections: "All Protocols",
            fileheaderSelections: "All File Headers"
        }
    },
    mounted() {
        window.addEventListener("resize", this.windowWidthChanged);

        this.windowWidthChanged(); // run once initially
    },
    methods: {
        windowWidthChanged(event) {
            if (document.documentElement.clientWidth < 540) {
                this.inputPlaceholder = this.inputPlaceholders[1];
            } else {
                this.inputPlaceholder = this.inputPlaceholders[0];
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
</style>