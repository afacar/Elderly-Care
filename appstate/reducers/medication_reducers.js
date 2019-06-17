import {
    MEDICATION_FETCH,
} from '../actions/types';

const INITIAL_STATE = {
    data: [],           // List of medication
};

export default function(state=INITIAL_STATE, action) {
    switch(action.type) {
        case MEDICATION_FETCH:
            return {...INITIAL_STATE, data: action.payload};
        default:
            return state;
    }
}