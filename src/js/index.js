import '../styles/main.css'
import { h } from 'jsx-dom' // eslint-disable-line
import morphdom from 'morphdom'
import SideMenu from './components/side-menu'
import store from './store'

console.log('And we are go')

const container = document.getElementById('main')

let dom = SideMenu(store.getState().documents)
container.appendChild(dom)

store.subscribe(() =>
  container.appendChild(morphdom(dom, SideMenu(store.getState().documents)))
)
