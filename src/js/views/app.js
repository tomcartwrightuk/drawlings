import { h } from 'jsx-dom' // eslint-disable-line
import SideMenu from './components/side-menu'
import Canvas from './components/canvas'

export default (state) => (
  <div className='app'>
    <SideMenu state={state} />
    <Canvas element={state.documents[state.currentDoc].elements[0]} />
  </div>
)
