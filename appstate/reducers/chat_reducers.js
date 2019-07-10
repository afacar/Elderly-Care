import {
  CHATS_FETCH,
  CHATS_AUDIO
} from '../actions/types';

const INITIAL_STATE = { 
  rooms: [],
  currentAudio: {
    id: "",
  }
};


export default function(state=INITIAL_STATE, action) {
  switch(action.type) {
      case CHATS_FETCH:
        return {rooms: action.payload};
      case CHATS_AUDIO:
        return {currentAudio: action.payload};
      default:
        return state;
  }
}