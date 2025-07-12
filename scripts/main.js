import { appData } from './data.js';
import { appMethods } from './methods.js';
import { appComputed } from './computed.js';
import { appLifecycle } from './lifecycle.js';

const app = new Vue({
  el: '#app',
  data: appData,
  computed: appComputed,
  methods: appMethods,
  ...appLifecycle
});
