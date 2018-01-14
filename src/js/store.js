import { createStore } from 'redux'
import { ADD_DOC } from './action-types'

const initialState = {
  documents: [
    {title: 'Ramble chats'},
    {title: 'Beep. boop'}
  ]
}

const blankDocument = {
  title: '< insert title >'
}

const reducer = (state = initialState, { payload, type }) => {
  console.log('Reducer action: ', type)
  switch (type) {
    case ADD_DOC:
      return {
        ...state,
        documents: state.documents.concat([blankDocument])
      }
    default:
      return state
  }
}

export default createStore(reducer, initialState)
