import {
  ATTEMPT,
  SUCCESS,
  FAIL,
  CLEAR,
  EDIT,
  MODAL,
} from '../actions/types';

const INITIAL_STATE = {
  error: '',
  loading: false,
  successMessage: '',
  modalVisible: false,
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case ATTEMPT:
      return { ...INITIAL_STATE, loading: true };
    case SUCCESS:
      return { ...INITIAL_STATE, successMessage: action.payload };
    case FAIL:
      return { ...INITIAL_STATE, error: action.payload };
    case CLEAR:
      return INITIAL_STATE;
    case MODAL:
      return { ...state, modalVisible: action.payload };
    default:
      return state;
  }
}