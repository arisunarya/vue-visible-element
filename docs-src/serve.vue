<script>
import Vue from 'vue';
import VueVisibleElement from '@/src/vue-visible-element.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueVisibleElement
  },
  methods: {
    handleEvent({ index, elm }, event) {
      console.log(index, event, elm)
    }
  }
});
</script>

<template>
  <div id="app">
    <vue-visible-element
      @onscreen="elm => handleEvent(elm, 'parent onscreen')"
      @offscreen="elm => handleEvent(elm, 'parent offscreen')">
      <template slot="contain">
        <div class="box"/>
        <div class="box"/>
        <div class="box"/>
        <div class="box"/>
        <div class="box"/>
        <div class="box"/>
        <vue-visible-element
          class="parent carousel scroll"
          :scrollable="true"
          @offcanvas="elm => handleEvent(elm, 'offcanvas')"
          @oncanvas="elm => handleEvent(elm, 'oncanvas')"
          @offscreen="elm => handleEvent(elm, 'offscreen')"
          @onscreen="elm => handleEvent(elm, 'onscreen')"
          @invisible="elm => handleEvent(elm, 'invisible')"
          @visible="elm => handleEvent(elm, 'visible')">
          <!-- <template slot="prepend">
            <div
              v-for="i in 1"
              :key="`prepend${i}`"
              class="child">
              <div class="card">
                <span>prepend <b>{{ i }}</b></span>
              </div>
            </div>
          </template>
          <template slot="append">
            <div class="child">
              <div class="car">append</div>
            </div>
          </template> -->
          <template slot="contain">
            <div
              v-for="i in 1"
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
      </template>
    </vue-visible-element>
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
  position: relative;
}

.card::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0%;
  right: 0%;
  height: 1px;
  background: red;
}
</style>
