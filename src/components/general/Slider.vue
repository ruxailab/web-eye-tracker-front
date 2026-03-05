<template>
    <v-container>
        <v-row>
            <v-col>
                {{ label }} : {{ sliderValue }}
                <v-slider v-model="sliderValue" :min="min" :max="max" :step="step"
                    class="my-slider"></v-slider>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script>
export default {
    props: {
        step: {
            type: Number,
            default: 1,
        },
        value: {
            type: Number,
            default: 0,
        },
        min: {
            type: Number,
            default: 5,
        },
        max: {
            type: Number,
            default: 100,
        },
        label: String,
    },
    data() {
        const num = Number(this.value);
        return {
            sliderValue: (num === num ? num : this.min),
        };
    },
    watch: {
        value(newVal) {
            const num = Number(newVal);
            if (num === num && num !== this.sliderValue) {
                this.sliderValue = num;
            }
        },
        sliderValue(newVal) {
            const num = Number(newVal);
            const safe = num === num ? num : this.min;
            if (this.sliderValue !== safe) {
                this.sliderValue = safe;
            }
            this.$emit('input', safe);
        },
    },
    methods: {
        updateValue() {
            const num = Number(this.sliderValue);
            this.$emit('input', num === num ? num : this.min);
        },
    },
};
</script>