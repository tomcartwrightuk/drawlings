const points = [
  {x: 269, y: 377, width: 6},
  {x: 269.001, y: 377.001, width: 6},
  {x: 268, y: 376, width: 6},
  {x: 268, y: 364, width: 6},
  {x: 273, y: 343, width: 6},
  {x: 288, y: 314, width: 6},
  {x: 337, y: 278, width: 6},
  {x: 412, y: 267, width: 6},
  {x: 492, y: 279, width: 6},
  {x: 564, y: 312, width: 6},
  {x: 601, y: 345, width: 6},
  {x: 635, y: 388, width: 6}
]

// Console for ipad dev
// const consoleContainer = document.getElementById('console-container')
// window.console = {
//   log: (d) => {
//     const li = document.createElement('LI')
//     const text = document.createTextNode('>    ' + d)
//     li.appendChild(text)
//     consoleContainer.appendChild(li)
//   },
//   error: (d) => {
//     const li = document.createElement('LI')
//     const text = document.createTextNode('>    ' + d)
//     li.appendChild(text)
//     consoleContainer.appendChild(li)
//   }
// }

const hat = () => Math.random()
  .toString(36)
  .substring(2, 15) + Math.random()
  .toString(36)
  .substring(2, 15)

// Store and app state
let state = {1: {pts: points}}
let color = 'rgba(15, 68, 153, 0.6)'
let currentPathId

// create canvas
let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')
document.body.appendChild(canvas)
setupCanvas()

function setupCanvas () {
  // calculate scale factor for retina displays
  let devicePixelRatio = window.devicePixelRatio || 1
  let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1
  let ratio = devicePixelRatio / backingStoreRatio

  // set canvas width and scale factor
  canvas.width = window.innerWidth * ratio
  canvas.height = window.innerHeight * ratio
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx.scale(ratio, ratio)

  // set stroke options
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // set font options
  ctx.fillStyle = 'rgb(255,0,0)'
  ctx.font = '16px sans-serif'
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

function multiDraw () {
  var midpoints = []
  Object.keys(state).forEach(function (id) {
    // var data = state[id]
    var data = {pts: points}

    // draw paths
    console.log(data.pts)
    if (data.pts) {
      data.pts.forEach(function (point, i) {
        console.log('X: ' + point.x + 'Y: ' + point.y)
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          const prevPt = data.pts[i - 1]
          ctx.beginPath()
          ctx.moveTo(prevPt.x, prevPt.y)

          const midPoint = getMidPoint(prevPt, point)
          midpoints.push(midPoint)
          ctx.strokeStyle = color
          ctx.lineWidth = point.width
          // ctx.lineTo(point.x, point.y)
          ctx.quadraticCurveTo(midPoint.x, midPoint.y, point.x, point.y)
          ctx.stroke()
        }
      })
      midpoints.forEach(function (point, i) {
        ctx.beginPath()
        ctx.moveTo(point.x, point.y)
        ctx.fillStyle = 'rgba(255,255,0,0.6)'
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        ctx.fill()
      })
    }
  })
}

function redraw () {
  console.log(window.location.search)
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // draw the current state
  if (window.location.search.match(/multi/)) {
    multiDraw()
  } else {
    let midpoints = []
    Object.keys(state).forEach(function (id) {
      // var data = state[id]
      var data = {pts: points}
      // draw paths
      ctx.beginPath()
      if (data.pts) {
        data.pts.forEach(function (point, i) {
          console.log('X: ' + point.x + 'Y: ' + point.y)
          if (i === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            const prevPt = data.pts[i - 1]
            const midPoint = getMidPoint(prevPt, point)
            midpoints.push(midPoint)
            ctx.strokeStyle = color
            ctx.lineWidth = point.width
            ctx.quadraticCurveTo(prevPt.x, prevPt.y, midPoint.x, midPoint.y)
          }
        })
        ctx.stroke()
        midpoints.forEach(function (point, i) {
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.fillStyle = 'rgba(255,255,0,0.6)'
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
          ctx.fill()
        })
        data.pts.forEach(function (point, i) {
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.fillStyle = 'rgba(255,124,0,0.6)'
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
          ctx.fill()
        })
      }
    })
  }
}

canvas.addEventListener('mousedown', onDown)
canvas.addEventListener('touchstart', onDown)

function onDown (e) {
  e.preventDefault()
  currentPathId = hat()
  const lineWidth = 30 * ((e.touches && e.touches[0].force) || 0.2)
  var x = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) || 0
  var y = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageY) || 0
  var p1 = { x: x, y: y, width: lineWidth }
  var p2 = {
    x: x + 0.001,
    y: y + 0.001,
    width: lineWidth
  } // paint point on click

  state[currentPathId] = { color: color, pts: [ p1, p2 ] }
  redraw()
}

canvas.addEventListener('mousemove', onMove)
canvas.addEventListener('touchmove', onMove)

function onMove (e) {
  const lineWidth = 30 * ((e.touches && e.touches[0].force) || 0.2)
  var x = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) || 0
  var y = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageY) || 0
  if (currentPathId) {
    var pt = { x: x, y: y, width: lineWidth }
    state[currentPathId].pts.push(pt)
    redraw()
  }
}

document.body.addEventListener('mouseup', onUp)
document.body.addEventListener('touchend', onUp)

function onUp () {
  currentPathId = null
}
