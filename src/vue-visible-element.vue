<script>
export default /*#__PURE__*/{
  name: 'VueVisibleElement',
	props: {
		tag: {
			type: String,
			default: 'div'
		},
		mapping: {
			type: Function,
			default: child => child
			// deep child selector example: child => child.children[0].children[0]
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
	data () {
		return {
			throttled: () => {},
			childs: []
		}
	},
	methods: {
		scan () {
			const slots = this.$slots.contain
			if (!slots) return

			const childs = slots.filter(child => child.tag).map(this.mapping)
			const getChild = elm => this.childs.find(child => child.elm === elm)
			const addChild = elm => this.childs.push({
				visible: false,
				onScreen: false,
				onCanvas: false,
				elm
			})

			for(let index = 0; index < childs.length; index++) {
				const { elm } = childs[index]
				if (!getChild(elm)) addChild(elm)

				const child = getChild(elm)
				const payload = { index, elm }
				const rect = elm.getBoundingClientRect()
				const rectPosX = rect.x + (rect.width / 2)
				const rectPosY = rect.y + (rect.height / 2)
				const canvasRect = this.$el.getBoundingClientRect()
				const canvasPosX =  rect.x - canvasRect.x + (rect.width / 2)
				const canvasPosY =  rect.y - canvasRect.y + (rect.height / 2)

				const isVisibleOnScreen =
					rectPosX >= 0 &&
					rectPosY >= 0 &&
					rectPosX <= window.innerWidth &&
					rectPosY <= window.innerHeight

				const isFullyVisibleOnScreen = 
					rect.x + rect.width >= 0 &&
					rect.y + rect.height >= 0 &&
					rect.x <= window.innerWidth &&
					rect.y <= window.innerHeight

				const isVisibleOnCanvas = 
					canvasPosX >= 0 &&
					canvasPosY >= 0 &&
					canvasPosX <= canvasRect.width &&
					canvasPosY <= canvasRect.height
				
				const isFullyVisibleOnCanvas =
					rect.x - canvasRect.x + rect.width >= 0 &&
					rect.y - canvasRect.y + rect.height >= 0 &&
					rect.x - canvasRect.x <= canvasRect.width &&
					rect.y - canvasRect.y <= canvasRect.height

				const isVisible =
					isVisibleOnCanvas &&
					isVisibleOnScreen

				const isFullyVisible =
					isFullyVisibleOnCanvas &&
					isFullyVisibleOnScreen

				if (!isFullyVisible && child.visible) {
					child.visible = false
					this.$emit('invisible', payload)
				} else if (isVisible && !child.visible) {
					child.visible = true
					this.$emit('visible', payload)
				}

				if (!isFullyVisibleOnCanvas && child.onCanvas) {
					child.onCanvas = false
					this.$emit('offcanvas', payload)
				} else if (isVisibleOnCanvas && !child.onCanvas) {
					child.onCanvas = true
					this.$emit('oncanvas', payload)
				}

				if (!isFullyVisibleOnScreen && child.onScreen) {
					child.onScreen = false
					this.$emit('offscreen', payload)
				} else if (isVisibleOnScreen && !child.onScreen) {
					child.onScreen = true
					this.$emit('onscreen', payload)
				}
			}
		},
		reset () {
			this.childs = []
			this.$emit('reset')
			return this.scan
		},
		rescan () {
			this.reset()
			this.scan()
		},
		addScrollEvent (target) {
			target.addEventListener('scroll', this.throttled)
		},
		removeScrollEvent (target) {
			target.addEventListener('scroll', this.throttled)
		},
		throttleFn (callback, limit) {
			let waiting = false
			return function () {
				if (!waiting) {
					callback.apply(this, arguments)
					waiting = true
					setTimeout(function () {
						waiting = false
					}, limit)
				}
			}
		}
	},
	watch: {
		scroll: {
			immediate: true,
			handler (scroll) {
				if (typeof window === 'undefined') return
				this.$nextTick(() => {
					if (scroll) this.addScrollEvent(window)
					else this.removeScrollEvent(window)
				})
			}
		},
		scrollable: {
			immediate: true,
			handler (scrollable) {
				this.$nextTick(() => {
					if (scrollable) this.addScrollEvent(this.$el)
					else this.removeScrollEvent(this.$el)
				})
			}
		}
	},
	mounted () {
		this.throttled = this.throttleFn(this.scan, this.throttle)
		if (this.immediate) this.scan()
	},
	beforeDestroy () {
		if (this.scroll) this.removeScrollEvent(window)
		if (this.scrollable) this.removeScrollEvent(this.$el)
	}
}
</script>

<template>
	<component
		:is="tag"
		v-bind="$attrs"
		v-on="$listeners">
		<slot
			:scan="scan"
			name="prepend"/>
		<slot
			:scan="scan"
			name="contain"/>
		<slot
			:scan="scan"
			name="append"/>
	</component>
</template>
