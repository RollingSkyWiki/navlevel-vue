import * as Vue from 'vue';
if (__NO_MW__) {
    window.Vue = Vue;
}
declare global {
    const __NO_MW__: boolean;
    const HOST: string;
}