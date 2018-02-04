import { h } from 'jsx-dom' // eslint-disable-line
import SideMenu from './components/side-menu'
import * as Canvas from './components/canvas'

export default (state) => {
  const currentElement = state.documents[state.currentDoc].elements[0]
  const CanvasRender = Canvas.render(currentElement)

  return (<div className='app'>
    <SideMenu state={state} />
    <CanvasRender />
  </div>)
}
