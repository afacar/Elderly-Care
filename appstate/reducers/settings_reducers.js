import {
  SUMMARY_FETCH,
} from '../actions/types';

const INITIAL_STATE = { };

export default function(state=INITIAL_STATE, action) {
  switch(action.type) {
      case SUMMARY_FETCH:
        return {...action.payload};
      default:
          return state;
  }
}