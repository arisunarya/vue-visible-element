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
			default: 200
		},
		impression: {
			type: Number,
			default: 0
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

			const isVisibleOnScreen = elm => {
				const rect = elm.getBoundingClientRect()
				const rectPosX = rect.x + (rect.width / 2)
				const rectPosY = rect.y + (rect.height / 2)
				return (
					rectPosX >= 0 &&
					rectPosY >= 0 &&
					rectPosX <= window.innerWidth &&
					rectPosY <= window.innerHeight
				)
			}

			const isFullyVisibleOnScreen = elm => {
				const rect = elm.getBoundingClientRect()
				return (
					rect.x + rect.width >= 0 &&
					rect.y + rect.height >= 0 &&
					rect.x <= window.innerWidth &&
					rect.y <= window.innerHeight
				)
			}

			const isVisibleOnCanvas = elm => {
				const rect = elm.getBoundingClientRect()
				const canvasRect = this.$el.getBoundingClientRect()
				const canvasPosX =  rect.x - canvasRect.x + (rect.width / 2)
				const canvasPosY =  rect.y - canvasRect.y + (rect.height / 2)
				return (
					canvasPosX >= 0 &&
					canvasPosY >= 0 &&
					canvasPosX <= canvasRect.width &&
					canvasPosY <= canvasRect.height
				)
			}

			const isFullyVisibleOnCanvas = elm => {
				const rect = elm.getBoundingClientRect()
				const canvasRect = this.$el.getBoundingClientRect()
				return (
					rect.x - canvasRect.x + rect.width >= 0 &&
					rect.y - canvasRect.y + rect.height >= 0 &&
					rect.x - canvasRect.x <= canvasRect.width &&
					rect.y - canvasRect.y <= canvasRect.height
				)
			}

			const isVisible = elm =>
				isVisibleOnCanvas(elm) &&
				isVisibleOnScreen(elm)

			const isFullyVisible = elm =>
				isFullyVisibleOnCanvas(elm) &&
				isFullyVisibleOnScreen(elm)

			for(let index = 0; index < childs.length; index++) {
				const { elm } = childs[index]
				if (!getChild(elm)) addChild(elm)

				const child = getChild(elm)
				const payload = { index, elm }

				if (!isFullyVisible(elm) && child.visible) {
					child.visible = false
					this.$emit('invisible', payload)
				} else if (isVisible(elm) && !child.visible) {
					setTimeout(() => {
						if (this.impression === 0 || (isVisible(elm) && !child.visible)) {
							child.visible = true
							this.$emit('visible', payload)
						}
					}, this.impression)
				}

				if (!isFullyVisibleOnCanvas(elm) && child.onCanvas) {
					child.onCanvas = false
					this.$emit('offcanvas', payload)
				} else if (isVisibleOnCanvas(elm) && !child.onCanvas) {
					setTimeout(() => {
						if (this.impression === 0 || (isVisibleOnCanvas(elm) && !child.onCanvas)) {
							child.onCanvas = true
							this.$emit('oncanvas', payload)
						}
					}, this.impression)
				}

				if (!isFullyVisibleOnScreen(elm) && child.onScreen) {
					child.onScreen = false
					this.$emit('offscreen', payload)
				} else if (isVisibleOnScreen(elm) && !child.onScreen) {
					setTimeout(() => {
						if (this.impression === 0 || (isVisibleOnScreen(elm) && !child.onScreen)) {
							child.onScreen = true
							this.$emit('onscreen', payload)
						}
					}, this.impression)
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
				this.$nextTick(() => {
					if (typeof window === 'undefined') return
					if (scroll) this.addScrollEvent(window)
					else this.removeScrollEvent(window)
				})
			}
		},
		scrollable: {
			immediate: true,
			handler (scrollable) {
				this.$nextTick(() => {
					if (typeof window === 'undefined') return
					if (scrollable) this.addScrollEvent(this.$el)
					else this.removeScrollEvent(this.$el)
				})
			}
		}
	},
	mounted () {
		this.throttled = this.throttleFn(this.scan, this.throttle)
		if (this.immediate) this.throttled()
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
