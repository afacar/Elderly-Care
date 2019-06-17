import {
    LOGIN,
} from '../actions/types';

const INITIAL_STATE = { 
    user: null,
};


export default function(state=INITIAL_STATE, action) {
    switch(action.type) {
        //case LOGIN_ATTEMPT:
        //    return { ...state, error: '', loading: true};
        case LOGIN:
            return {...state, user: action.payload};
        default:
            return state;
    }
}