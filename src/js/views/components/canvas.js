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

const addFrontListeners = (el, docId, elId) => {
  el.addEventListener('mouseup', onUp(docId, elId))
  el.addEventListener('mousemove', onMove(docId, elId))
  el.addEventListener('mousedown', onDown(docId, elId))
  el.addEventListener('touchend', onUp(docId, elId))
  el.addEventListener('touchmove', onMove(docId, elId))
  el.addEventListener('touchstart', onDown(docId, elId))
}

export const render = ({ doc, element }) => {
  const el = element
  console.log('Rendering a canvas')

  frontCanvas = (<canvas id={`canvas-front-${doc.id}-${el.id}`} />)
  const back = (<canvas id={`canvas-back-${doc.id}-${element.id}`} />)
  addFrontListeners(frontCanvas, doc.id, el.id)
  frontCtx = frontCanvas.getContext('2d')
  backCtx = back.getContext('2d')
  frontCanvas.style.zIndex = 10
  back.style.zIndex = 5

  const devicePixelRatio = window.devicePixelRatio || 1
  const backingStoreRatio = frontCtx.webkitBackingStorePixelRatio ||
     frontCtx.mozBackingStorePixelRatio ||
     frontCtx.msBackingStorePixelRatio ||
     frontCtx.oBackingStorePixelRatio ||
     frontCtx.backingStorePixelRatio || 1
  const ratio = devicePixelRatio / backingStoreRatio
  const canvasWidth = window.innerWidth - leftOffset

  const canvases = [frontCanvas, back]
  canvases.forEach(canvas => {
    canvas.width = (window.innerWidth - leftOffset) * ratio
    canvas.height = window.innerHeight * ratio
    canvas.style.width = canvasWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    canvas.style.position = 'absolute'
    canvas.style.left = leftOffset + 'px'
    canvas.style.front = '0px'
  })
  const contexts = [frontCtx, backCtx]
  contexts.forEach(ctx => {
    ctx.scale(ratio, ratio)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = 'rgb(255,0,0)'
    ctx.font = '16px sans-serif'
  })
  state[doc.id] = state[doc.id] || {}
  state[doc.id][element.id] = state[doc.id][element.id] || {}
  redraw(doc.id, el.id)(true)
  return (<div className='drawing-container' data-element={`${doc.id}-${element.id}`}>
    {back}
    {frontCanvas}
  </div>)
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
    // the smoothing algorithm
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
  const currentState = state[doc][element]
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

function redraw (docId, elementId) {
  return function (setup) {
    if (setup) {
      // alert('redraw')
    }
     // clear canvas
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height)
    // draw the current state
    var data = state[docId][elementId][currentPathId]
    if (data && data.pts) {
      drawPoints(data.pts, frontCtx)
    }
  }
}

function getLineWidth (e) {
  return parseFloat((30 * ((e.touches && e.touches[0].force) || 0.4)).toFixed(3))
}

function onDown (docId, elementId) {
  const draw = redraw(docId, elementId)
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

    state[docId][elementId][currentPathId] = { color: color, pts: [ p1, p2 ] }
    draw()
  }
}

function onMove (docId, elementId) {
  const draw = redraw(docId, elementId)
  return function (e) {
    const lineWidth = getLineWidth(e)
    var x = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) || 0
    var y = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageY) || 0
    const offsetX = x - leftOffset
    if (currentPathId) {
      var pt = { x: offsetX, y: y, width: lineWidth }
      state[docId][elementId][currentPathId].pts.push(pt)
      draw()
    }
  }
}

function onUp (docId, elId) {
  return function () {
    currentPathId = null
    refreshBtmCanvas(docId, elId)()
  }
}
