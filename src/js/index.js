import '../styles/main.css'
import { h } from 'jsx-dom' // eslint-disable-line
// import * as morphdom from 'morphdom'
import SideMenu from './components/side-menu'

const container = document.getElementById('main')
const leftOffset = 50
const appState = { documents: [
  {title: 'Ramble chats'},
  {title: 'Beep. boop'}
]}

let dom = SideMenu(appState.documents)
container.appendChild(dom)

// Console for ipad dev
if (window.location.search.match('console')) {
  const consoleEl = document.getElementById('console')
  const consoleContainer = document.getElementById('console-container')
  const initialConsoleHeight = consoleEl.clientHeight
  consoleEl.style.display = 'block'
  window.console = {
    log: (d) => {
      const li = document.createElement('LI')
      const text = document.createTextNode('>    ' + d)
      li.appendChild(text)
      consoleContainer.appendChild(li)
      // scroll to the top of the current console list to keep it visisble
      consoleContainer.style.marginTop = -(consoleContainer.clientHeight - initialConsoleHeight + 30) + 'px'
    },
    error: (d) => {
      const li = document.createElement('LI')
      const text = document.createTextNode('>    ' + d)
      li.appendChild(text)
      consoleContainer.appendChild(li)
    }
  }
}

console.log('And we are go')

const hat = () => Math.random()
  .toString(36)
  .substring(2, 15) + Math.random()
  .toString(36)
  .substring(2, 15)

// Store and app state
let state = {}
let color = 'rgba(74, 98, 112, 1)'
let currentPathId

// create canvas
let topCanvas = document.createElement('canvas')
let topCtx = topCanvas.getContext('2d')
let bottomCanvas = document.createElement('canvas')
let btCtx = bottomCanvas.getContext('2d')
const mainEl = document.getElementById('main')
mainEl.appendChild(bottomCanvas)
mainEl.appendChild(topCanvas)
setupCanvas()

function setupCanvas () {
  // calculate scale factor for retina displays
  let devicePixelRatio = window.devicePixelRatio || 1
  let backingStoreRatio = topCtx.webkitBackingStorePixelRatio ||
    topCtx.mozBackingStorePixelRatio ||
    topCtx.msBackingStorePixelRatio ||
    topCtx.oBackingStorePixelRatio ||
    topCtx.backingStorePixelRatio || 1
  let ratio = devicePixelRatio / backingStoreRatio
  const canvasWidth = window.innerWidth - leftOffset

  // set canvas width and scale factor
  topCanvas.width = (window.innerWidth - leftOffset) * ratio
  topCanvas.height = window.innerHeight * ratio
  topCanvas.style.width = canvasWidth + 'px'
  topCanvas.style.height = window.innerHeight + 'px'
  topCanvas.style.zIndex = '10'
  topCanvas.style.position = 'absolute'
  topCanvas.style.left = leftOffset + 'px'
  topCanvas.style.top = '0px'
  topCtx.scale(ratio, ratio)

  // set stroke options
  topCtx.lineCap = 'round'
  topCtx.lineJoin = 'round'

  // set font options
  topCtx.fillStyle = 'rgb(255,0,0)'
  topCtx.font = '16px sans-serif'

  // set canvas width and scale factor
  bottomCanvas.width = (window.innerWidth - leftOffset) * ratio
  bottomCanvas.height = window.innerHeight * ratio
  bottomCanvas.className = 'bottom'
  bottomCanvas.style.width = canvasWidth + 'px'
  bottomCanvas.style.height = window.innerHeight + 'px'
  bottomCanvas.style.position = 'absolute'
  bottomCanvas.style.left = leftOffset + 'px'
  bottomCanvas.style.top = '0px'
  bottomCanvas.style.zIndex = '5'
  btCtx.scale(ratio, ratio)

  // set stroke options
  btCtx.lineCap = 'round'
  btCtx.lineJoin = 'round'

  // set font options
  btCtx.fillStyle = 'rgb(255,0,0)'
  btCtx.font = '16px sans-serif'
  redraw()
}

function getMidPoint (p1, p2) {
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

function refreshBtmCanvas () {
  // clear bottom context, render everything and then clear top canvas
  btCtx.clearRect(0, 0, topCanvas.width, topCanvas.height)
  Object.keys(state).forEach(function (id) {
    if (id === currentPathId) {
      return
    }
    var data = state[id]
    // draw paths
    if (data.pts) {
      drawPoints(data.pts, btCtx)
    }
  })
  topCtx.clearRect(0, 0, topCanvas.width, topCanvas.height)
}

function multiDraw () {
  var data = state[currentPathId]
  if (data && data.pts) {
    drawPoints(data.pts, topCtx)
  }
}

function redraw () {
  // clear canvas
  topCtx.clearRect(0, 0, topCanvas.width, topCanvas.height)
  // draw the current state
  multiDraw()
}

topCanvas.addEventListener('mousedown', onDown)
topCanvas.addEventListener('touchstart', onDown)

function getLineWidth (e) {
  return parseFloat((30 * ((e.touches && e.touches[0].force) || 0.4)).toFixed(3))
}

function onDown (e) {
  e.preventDefault()
  currentPathId = hat()
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

  state[currentPathId] = { color: color, pts: [ p1, p2 ] }
  redraw()
}

topCanvas.addEventListener('mousemove', onMove)
topCanvas.addEventListener('touchmove', onMove)

function onMove (e) {
  const lineWidth = getLineWidth(e)
  var x = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) || 0
  var y = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageY) || 0
  const offsetX = x - leftOffset
  if (currentPathId) {
    var pt = { x: offsetX, y: y, width: lineWidth }
    state[currentPathId].pts.push(pt)
    redraw()
  }
}

document.body.addEventListener('mouseup', onUp)
document.body.addEventListener('touchend', onUp)

function onUp () {
  currentPathId = null
  refreshBtmCanvas()
}
