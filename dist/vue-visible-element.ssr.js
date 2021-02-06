'use strict';function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}var script = /*#__PURE__*/{
  name: 'VueVisibleElement',
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    mapping: {
      type: Function,
      default: function _default(child) {
        return child;
      } // deep child selector example: child => child.children[0].children[0]

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
  data: function data() {
    return {
      throttled: function throttled() {},
      childs: []
    };
  },
  methods: {
    scan: function scan() {
      var _this = this;

      var slots = this.$slots.contain;
      if (!slots) return;
      var childs = slots.filter(function (child) {
        return child.tag;
      }).map(this.mapping);

      var getChild = function getChild(elm) {
        return _this.childs.find(function (child) {
          return child.elm === elm;
        });
      };

      var addChild = function addChild(elm) {
        return _this.childs.push({
          visible: false,
          onScreen: false,
          onCanvas: false,
          elm: elm
        });
      };

      for (var index = 0; index < childs.length; index++) {
        var elm = childs[index].elm;
        if (!getChild(elm)) addChild(elm);
        var child = getChild(elm);
        var payload = {
          index: index,
          elm: elm
        };
        var rect = elm.getBoundingClientRect();
        var rectPosX = rect.x + rect.width / 2;
        var rectPosY = rect.y + rect.height / 2;
        var canvasRect = this.$el.getBoundingClientRect();
        var canvasPosX = rect.x - canvasRect.x + rect.width / 2;
        var canvasPosY = rect.y - canvasRect.y + rect.height / 2;
        var isVisibleOnScreen = rectPosX >= 0 && rectPosY >= 0 && rectPosX <= window.innerWidth && rectPosY <= window.innerHeight;
        var isFullyVisibleOnScreen = rect.x + rect.width >= 0 && rect.y + rect.height >= 0 && rect.x <= window.innerWidth && rect.y <= window.innerHeight;
        var isVisibleOnCanvas = canvasPosX >= 0 && canvasPosY >= 0 && canvasPosX <= canvasRect.width && canvasPosY <= canvasRect.height;
        var isFullyVisibleOnCanvas = rect.x - canvasRect.x + rect.width >= 0 && rect.y - canvasRect.y + rect.height >= 0 && rect.x - canvasRect.x <= canvasRect.width && rect.y - canvasRect.y <= canvasRect.height;
        var isVisible = isVisibleOnCanvas && isVisibleOnScreen;
        var isFullyVisible = isFullyVisibleOnCanvas && isFullyVisibleOnScreen;

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
    reset: function reset() {
      this.childs = [];
      this.$emit('reset');
      return this.scan;
    },
    rescan: function rescan() {
      this.reset();
      this.scan();
    },
    addScrollEvent: function addScrollEvent(target) {
      target.addEventListener('scroll', this.throttled);
    },
    removeScrollEvent: function removeScrollEvent(target) {
      target.addEventListener('scroll', this.throttled);
    },
    throttleFn: function throttleFn(callback, limit) {
      var waiting = false;
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
      handler: function handler(scroll) {
        var _this2 = this;

        if (process.server) return;
        this.$nextTick(function () {
          if (scroll) _this2.addScrollEvent(window);else _this2.removeScrollEvent(window);
        });
      }
    },
    scrollable: {
      immediate: true,
      handler: function handler(scrollable) {
        var _this3 = this;

        if (process.server) return;
        this.$nextTick(function () {
          if (scrollable) _this3.addScrollEvent(_this3.$el);else _this3.removeScrollEvent(_this3.$el);
        });
      }
    }
  },
  mounted: function mounted() {
    this.throttled = this.throttleFn(this.scan, this.throttle);
    if (this.immediate) this.scan();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.scroll) this.removeScrollEvent(window);
    if (this.scrollable) this.removeScrollEvent(this.$el);
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
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

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = "data-v-4b9ac59a";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);// Import vue component
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),

var component = /*#__PURE__*/(function () {
  // Get component instance
  var installable = __vue_component__; // Attach install function executed by Vue.use()

  installable.install = function (Vue) {
    Vue.component('VueVisibleElement', installable);
  };

  return installable;
})(); // It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = directive;
var namedExports=/*#__PURE__*/Object.freeze({__proto__:null,'default': component});// only expose one global var, with named exports exposed as properties of
// that global var (eg. plugin.namedExport)

Object.entries(namedExports).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      exportName = _ref2[0],
      exported = _ref2[1];

  if (exportName !== 'default') component[exportName] = exported;
});module.exports=component;