# vue-visible-element

## Props
**tag**\
html tags or vue component (attributes & listeners are inherited)
- type: *String*
- default: `div`

**mapping**\
map function
 - type: *Function*
 - default: `child => child`

**throttle**\
throttle value for scroll event
 - type: *Number*
 - default: `200`

**scroll**\
enable/disable scroll event
 - type: *Boolean*
 - default: `true`

**scrollable**\
add listener to element scroll, component must have `overflow: scroll` / `overflow: auto`
 - type: *Boolean*
 - default: `false`

**immediate**\
trigger `scan` methods on mounted
 - type: *Boolean*
 - default: `true`

## Events
**onscreen**\
firing when childs is visible on the viewport

**offscreen**\
firing when childs is not visible on the viewport

**oncanvas**\
firing when childs is visible on parent container

**offcanvas**\
firing when childs is not visible on parent container

**visible**\
firing when childs is visible on parent container & viewport

**invisible**\
firing when childs is not visible at all

## Methods
**scan**\
check child visibility & fire events

**reset**\
reset child visibilty state

**rescan**\
run `reset` & `scan` methods
