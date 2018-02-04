import { createStore } from 'redux'
import { ADD_DOC, TOGGLE_NAV, SELECT_DOC } from './action-types'

const initialState = {
  documents: [
    {
      id: 1,
      title: 'Ramble chats',
      elements: [
        {
          id: 1,
          type: 'drawing',
          content: {
            paths: []
          }
        }
      ]
    }
  ],
  currentDoc: 0,
  navOpen: true,
  documentCount: 1
}

const getId = state => state.documentCount + 1

const blankDocument = (state) => ({
  id: getId(state),
  title: `Doc ${getId(state)}`,
  elements: [
    {
      id: 1,
      type: 'drawing',
      content: {
        paths: []
      }
    }
  ]
})

const reducer = (state = initialState, { payload, type }) => {
  switch (type) {
    case ADD_DOC:
      return {
        ...state,
        documents: state.documents.concat([blankDocument(state)]),
        documentCount: state.documentCount + 1,
        currentDoc: state.documentCount
      }
    case TOGGLE_NAV:
      return {
        ...state,
        navOpen: !state.navOpen
      }
    case SELECT_DOC:
      return {
        ...state,
        currentDoc: payload.currentDocIdx
      }
    default:
      return state
  }
}

export default createStore(reducer, initialState)
