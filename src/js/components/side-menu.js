import { h } from 'jsx-dom' // eslint-disable-line

const nav = () => document.getElementById('side-nav')

function openNav () {
  nav().style.width = '250px'
}

function closeNav () {
  nav().style.width = '0'
}

const docLink = (doc) =>
  (
    <a href='#'>{doc.title}</a>
  )

export default (documents) => (
  <div>
    <div id='side-nav' className='side-nav'>
      <a href='javascript:void(0)' className='closebtn' onClick={closeNav}>&times;</a>
      {documents.map(doc => docLink(doc))}
      <div className='add-doc'>
        <a href='#'>&#65291;</a>
      </div>
    </div>

    <div className='side-nav-burger'>
      <span style='font-size:20px;cursor:pointer' onClick={openNav}>&#9776;</span>
    </div>
  </div>
)
