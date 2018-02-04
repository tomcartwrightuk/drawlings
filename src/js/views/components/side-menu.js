import { h } from 'jsx-dom' // eslint-disable-line
import store from '../../store'
import { ADD_DOC, TOGGLE_NAV } from '../../action-types'

const docLink = (doc) => (
  <a href='#'>{doc.title}</a>
)

const toggleNav = (e) => {
  e.preventDefault()
  return store.dispatch({ type: TOGGLE_NAV })
}

const addDoc = (e) => {
  e.preventDefault()
  return store.dispatch({ type: ADD_DOC })
}

export default ({ state }) => (
  <div id='nav-container' className={(state.navOpen ? 'show-nav' : '')}>
    <div id='side-nav' className='side-nav'>
      <a href='javascript:void(0)' className='close-btn' onClick={toggleNav} onTouchstart={toggleNav}>&times;</a>
      {state.documents.map(doc => docLink(doc))}
      <div className='add-doc'>
        <a href='#' onClick={addDoc} onTouchstart={addDoc}>&#65291;</a>
      </div>
    </div>

    <div className='side-nav-burger'>
      <span style='font-size:20px;cursor:pointer' onClick={toggleNav} onTouchstart={toggleNav}>&#9776;</span>
    </div>
  </div>
)
