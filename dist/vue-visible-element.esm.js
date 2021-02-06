var script = /*#__PURE__*/{
  name: 'VueVisibleElement',
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    mapping: {
      type: Function,
      default: child => child // deep child selector example: child => child.children[0].children[0]

    },
    immediate: {
      type: Boolean,
      default: true
    },
    scroll: {
      type: Boolean,
      default: true
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    throttle: {
      type: Number,
      default: 500
    }
  },

  data() {
    return {
      throttled: () => {},
      childs: []
    };
  },

  methods: {
    scan() {
      const slots = this.$slots.contain;
      if (!slots) return;
      const childs = slots.filter(child => child.tag).map(this.mapping);

      const getChild = elm => this.childs.find(child => child.elm === elm);

      const addChild = elm => this.childs.push({
        visible: false,
        onScreen: false,
        onCanvas: false,
        elm
      });

      for (let index = 0; index < childs.length; index++) {
        const {
          elm
        } = childs[index];
        if (!getChild(elm)) addChild(elm);
        const child = getChild(elm);
        const payload = {
          index,
          elm
        };
        const rect = elm.getBoundingClientRect();
        const rectPosX = rect.x + rect.width / 2;
        const rectPosY = rect.y + rect.height / 2;
        const canvasRect = this.$el.getBoundingClientRect();
        const canvasPosX = rect.x - canvasRect.x + rect.width / 2;
        const canvasPosY = rect.y - canvasRect.y + rect.height / 2;
        const isVisibleOnScreen = rectPosX >= 0 && rectPosY >= 0 && rectPosX <= window.innerWidth && rectPosY <= window.innerHeight;
        const isFullyVisibleOnScreen = rect.x + rect.width >= 0 && rect.y + rect.height >= 0 && rect.x <= window.innerWidth && rect.y <= window.innerHeight;
        const isVisibleOnCanvas = canvasPosX >= 0 && canvasPosY >= 0 && canvasPosX <= canvasRect.width && canvasPosY <= canvasRect.height;
        const isFullyVisibleOnCanvas = rect.x - canvasRect.x + rect.width >= 0 && rect.y - canvasRect.y + rect.height >= 0 && rect.x - canvasRect.x <= canvasRect.width && rect.y - canvasRect.y <= canvasRect.height;
        const isVisible = isVisibleOnCanvas && isVisibleOnScreen;
        const isFullyVisible = isFullyVisibleOnCanvas && isFullyVisibleOnScreen;

        if (!isFullyVisible && child.visible) {
          child.visible = false;
          this.$emit('invisible', payload);
        } else if (isVisible && !child.visible) {
          child.visible = true;
          this.$emit('visible', payload);
        }

        if (!isFullyVisibleOnCanvas && child.onCanvas) {
          child.onCanvas = false;
          this.$emit('offcanvas', payload);
        } else if (isVisibleOnCanvas && !child.onCanvas) {
          child.onCanvas = true;
          this.$emit('oncanvas', payload);
        }

        if (!isFullyVisibleOnScreen && child.onScreen) {
          child.onScreen = false;
          this.$emit('offscreen', payload);
        } else if (isVisibleOnScreen && !child.onScreen) {
          child.onScreen = true;
          this.$emit('onscreen', payload);
        }
      }
    },

    reset() {
      this.childs = [];
      this.$emit('reset');
      return this.scan;
    },

    rescan() {
      this.reset();
      this.scan();
    },

    addScrollEvent(target) {
      target.addEventListener('scroll', this.throttled);
    },

    removeScrollEvent(target) {
      target.addEventListener('scroll', this.throttled);
    },

    throttleFn(callback, limit) {
      let waiting = false;
      return function () {
        if (!waiting) {
          callback.apply(this, arguments);
          waiting = true;
          setTimeout(function () {
            waiting = false;
          }, limit);
        }
      };
    }

  },
  watch: {
    scroll: {
      immediate: true,

      handler(scroll) {
        if (process.server) return;
        this.$nextTick(() => {
          if (scroll) this.addScrollEvent(window);else this.removeScrollEvent(window);
        });
      }

    },
    scrollable: {
      immediate: true,

      handler(scrollable) {
        if (process.server) return;
        this.$nextTick(() => {
          if (scrollable) this.addScrollEvent(this.$el);else this.removeScrollEvent(this.$el);
        });
      }

    }
  },

  mounted() {
    this.throttled = this.throttleFn(this.scan, this.throttle);
    if (this.immediate) this.scan();
  },

  beforeDestroy() {
    if (this.scroll) this.removeScrollEvent(window);
    if (this.scrollable) this.removeScrollEvent(this.$el);
  }

};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c(_vm.tag, _vm._g(_vm._b({
    tag: "component"
  }, 'component', _vm.$attrs, false), _vm.$listeners), [_vm._t("prepend", null, {
    "scan": _vm.scan
  }), _vm._v(" "), _vm._t("contain", null, {
    "scan": _vm.scan
  }), _vm._v(" "), _vm._t("append", null, {
    "scan": _vm.scan
  })], 2);
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

// Import vue component
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),

var entry_esm = /*#__PURE__*/(() => {
  // Get component instance
  const installable = __vue_component__; // Attach install function executed by Vue.use()

  installable.install = Vue => {
    Vue.component('VueVisibleElement', installable);
  };

  return installable;
})(); // It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = directive;

export default entry_esm;
