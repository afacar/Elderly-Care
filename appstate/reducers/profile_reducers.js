import {
  PROFILE_FETCH,
} from '../actions/types';

const INITIAL_STATE = {
  uid: '',
  photoURL: 'https://justice.org.au/wp-content/uploads/2017/08/avatar-icon-300x300.png',
  displayName: '',
  email: '',
  phoneNumber: '',
  birthdate: '01-01-1975',
  gender: 'K',
  address: '',
};

export default function(state=INITIAL_STATE, action) {
  switch(action.type) {
      case PROFILE_FETCH:
        action.payload.photoURL = action.payload.photoURL || INITIAL_STATE.photoURL;
        return {...action.payload};
      default:
          return state;
  }
}