import { h } from 'jsx-dom' // eslint-disable-line
// import store from '../../store'
const color = 'rgba(74, 98, 112, 1)'
const leftOffset = 50
const makeId = () => Math.random()
   .toString(36)
   .substring(2, 15) + Math.random()
   .toString(36)
   .substring(2, 15)

 // Store and app state
let state = {}
let currentPathId
let frontCtx
let backCtx
let frontCanvas

// Listen for canvases being added
document.addEventListener('DOMContentLoaded', function (event) {
  // select the target node
  var target = document.querySelector('#main')

  // create an observer instance
  var observer = new window.MutationObserver(function (mutations) {
    // TODO remove state from here
    let hasSetup = false
    mutations.forEach(function (mutation) {
      if (mutation.target.className.match('drawing-container') && !hasSetup) {
        hasSetup = true
        setup(mutation.target)
      }
    })
  })

  // configuration of the observer:
  var config = { attributes: true, childList: true, characterData: true, subtree: true }

// pass in the target node, as well as the observer options
  observer.observe(target, config)
})
// End of canvas listening

const getCanvases = (element) => ({
  front: element.getElementsByTagName('canvas')[0],
  back: element.getElementsByTagName('canvas')[1]
})

const getContexts = (element, canvases) => ({
  front: canvases.front.getContext('2d'),
  back: canvases.back.getContext('2d')
})

export const render = ({ doc, element }) => {
  const el = element
  return (<div className='drawing-container' data-element={`${doc.id}-${element.id}`}>
    <canvas id={`canvas-front-${doc.id}-${element.id}`} onmouseup={onUp(doc, el)} ontouchend={onUp(doc, el)} onmousemove={onMove(doc, el)} ontouchmove={onMove(doc, el)} onmousedown={onDown(doc, el)} ontouchstart={onDown(doc, el)} />
    <canvas id={`canvas-back-${doc.id}-${element.id}`} />
  </div>)
}

function setup (element) {
  console.log('Setting up the canvases')
  // calculate scale factor for retina displays
  // TODO: cache these values when device loads
  const canvases = getCanvases(element)
  const contexts = getContexts(element, canvases)
  frontCtx = contexts['front']
  backCtx = contexts['back']
  frontCanvas = canvases['front']

  const devicePixelRatio = window.devicePixelRatio || 1
  const backingStoreRatio = contexts.front.webkitBackingStorePixelRatio ||
     contexts.front.mozBackingStorePixelRatio ||
     contexts.front.msBackingStorePixelRatio ||
     contexts.front.oBackingStorePixelRatio ||
     contexts.front.backingStorePixelRatio || 1
  const ratio = devicePixelRatio / backingStoreRatio
  const canvasWidth = window.innerWidth - leftOffset

  Object.keys(canvases).forEach(position => {
    canvases[position].width = (window.innerWidth - leftOffset) * ratio
    canvases[position].height = window.innerHeight * ratio
    canvases[position].style.width = canvasWidth + 'px'
    canvases[position].style.height = window.innerHeight + 'px'
    canvases[position].style.position = 'absolute'
    canvases[position].style.left = leftOffset + 'px'
    canvases[position].style.front = '0px'
    contexts[position].scale(ratio, ratio)
    contexts[position].lineCap = 'round'
    contexts[position].lineJoin = 'round'
    contexts[position].fillStyle = 'rgb(255,0,0)'
    contexts[position].font = '16px sans-serif'
  })
  canvases['front'].style.zIndex = 10
  canvases['back'].style.zIndex = 5

  // redraw()
}

const getMidPoint = (p1, p2) => {
  let xDif = p2.x - p1.x
  let yDif = p2.y - p1.y
  return {
    x: p1.x + (xDif * 0.5),
    y: p1.y + (yDif * 0.5)
  }
}

function drawPoints (points, ctx) {
  let midpoints = []
  let firstPt = points[0]
  let secondPt = points[1] || firstPt
  let thirdPt = points[2] || secondPt
  let fourthPt = points[3] || thirdPt

  let prevWidth = parseFloat(firstPt.width)
  const widthPoints = points.map((p, i, ptArr) => {
    let ctxWidth
    const ptWidth = parseFloat(p.width)
    const topLimit = (prevWidth * 1.05).toFixed(3)
    const btmLimit = (prevWidth * 0.95).toFixed(3)
    if (ptWidth > topLimit) {
      ctxWidth = topLimit
    } else {
      if (ptWidth < btmLimit) {
        ctxWidth = btmLimit
      } else {
        ctxWidth = ptWidth
      }
    }
    prevWidth = ctxWidth
    return {x: p.x, y: p.y, width: parseFloat(ctxWidth)}
  })
  widthPoints.forEach(function (point, i) {
    ctx.strokeStyle = color
    if (i === 0) {
      ctx.moveTo(point.x, point.y)
      return
    }
    if (i === 1) {
      ctx.lineWidth = point.width
      const prevPt = points[i - 1]
      const midPoint = getMidPoint(prevPt, point)
      midpoints.push(midPoint)

      ctx.beginPath()
      ctx.lineTo(midPoint.x, midPoint.y)
      ctx.lineWidth = point.width
      ctx.stroke()
      ctx.closePath()
      return
    }

    const p1 = points[i - 2] || fourthPt
    const p2 = points[i - 1]
    const m1 = getMidPoint(p1, p2)
    const m2 = getMidPoint(p2, point)
    midpoints.push(m2)
    ctx.beginPath()
    ctx.lineWidth = point.width
    ctx.moveTo(m1.x, m1.y)
    ctx.quadraticCurveTo(p2.x, p2.y, m2.x, m2.y)
    if (i === points.length - 1) {
      // final point need line from midpoint to itself
      ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()
    ctx.closePath()
  })
}

function refreshBtmCanvas (doc, element) {
   // clear bottom context, render everything and then clear top canvas
  const currentState = state[doc.id][element.id]
  console.log(state)
  return function () {
    backCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height)
    Object.keys(currentState).forEach(function (id) {
      if (id === currentPathId) {
        return
      }
      const data = currentState[id]
       // draw paths
      if (data.pts) {
        drawPoints(data.pts, backCtx)
      }
    })
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height)
  }
}

function redraw (doc, element) {
  return function () {
     // clear canvas
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height)
    // draw the current state
    var data = state[doc.id][element.id][currentPathId]
    if (data && data.pts) {
      drawPoints(data.pts, frontCtx)
    }
  }
}

function getLineWidth (e) {
  return parseFloat((30 * ((e.touches && e.touches[0].force) || 0.4)).toFixed(3))
}

function onDown (doc, element) {
  const draw = redraw(doc, element)
  return function (e) {
    e.preventDefault()
    currentPathId = makeId()
    const lineWidth = getLineWidth(e)
    var x = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) || 0
    var y = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageY) || 0
    const offsetX = x - leftOffset
    var p1 = { x: offsetX, y: y, width: lineWidth }
    var p2 = {
      x: offsetX + 0.001,
      y: y + 0.001,
      width: lineWidth
    } // paint point on click

    state[doc.id] = state[doc.id] || {}
    state[doc.id][element.id] = state[doc.id][element.id] || {}
    state[doc.id][element.id][currentPathId] = { color: color, pts: [ p1, p2 ] }
    draw()
  }
}

function onMove (doc, element) {
  const draw = redraw(doc, element)
  return function (e) {
    const lineWidth = getLineWidth(e)
    var x = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) || 0
    var y = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageY) || 0
    const offsetX = x - leftOffset
    if (currentPathId) {
      var pt = { x: offsetX, y: y, width: lineWidth }
      state[doc.id][element.id][currentPathId].pts.push(pt)
      draw()
    }
  }
}

function onUp (doc, el) {
  return function () {
    currentPathId = null
    refreshBtmCanvas(doc, el)()
  }
}
