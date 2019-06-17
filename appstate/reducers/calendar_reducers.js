import {
  REMINDER_FETCH,
} from '../actions/types';

const INITIAL_STATE = {
  data: {},
};

export default function(state=INITIAL_STATE, action) {
  switch(action.type) {
      case REMINDER_FETCH:
          return {...INITIAL_STATE, data: action.payload };
      default:
          return state;
  }
}
