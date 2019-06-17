import {
  CHATS_FETCH,
} from '../actions/types';

const INITIAL_STATE = { 
  rooms: [],
};


export default function(state=INITIAL_STATE, action) {
  switch(action.type) {
      case CHATS_FETCH:
        return {rooms: action.payload};
      default:
        return state;
  }
}