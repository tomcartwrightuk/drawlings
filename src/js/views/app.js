import { h } from 'jsx-dom' // eslint-disable-line
import SideMenu from './components/side-menu'

export default (state) => (
  <div className='app'>
    <SideMenu state={state} />
  </div>
)
