import '../styles/main.css'
import { h } from 'jsx-dom' // eslint-disable-line
import morphdom from 'morphdom'
import App from './views/app'
import store from './store'

console.log('And we are go')

const container = document.getElementById('main')

// Build the app and append to the container
let app = App(store.getState())
container.appendChild(app)

// When state changes occur, build a new DOM and update the current one
store.subscribe(() =>
  morphdom(app, App(store.getState()))
)
