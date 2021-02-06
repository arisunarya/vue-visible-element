<script>
import Vue from 'vue';
import VueVisibleElement from '@/vue-visible-element.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueVisibleElement
  },
  methods: {
    handleVisible({ index, elm }) {
      console.log(index, elm)
    }
  }
});
</script>

<template>
  <div id="app">
    <div class="box"/>
    <div class="box"/>
    <div class="box"/>
    <div class="box"/>
    <vue-visible-element
      class="parent carousel scroll"
      @visible="handleVisible">
      <template slot="contain">
        <div
          v-for="i in 8"
          :key="i"
          class="child">
          <div class="card">
            <span>product <b>{{ i }}</b></span>
          </div>
        </div>
      </template>
    </vue-visible-element>
    <div class="box"/>
    <div class="box"/>
    <div class="box"/>
    <div class="box"/>
  </div>
</template>

<style>
.box {
	height: 200px;
	background: #eee;
	margin: 0 -16px 16px;
}

.scroll {
	height: 250px;
	overflow: auto;
}

.parent {
	display: flex;
	flex-wrap: wrap;
}
.parent.carousel {
  flex-wrap: unset;
}

.child {
	flex: 0 0 auto;
	width: 50%;
	padding: 8px;
}

.card {
  padding: 10px;
  background: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>
