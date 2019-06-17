import {
    DIAGNOSIS_FETCH,
    DIAGNOSIS_ADD,
    DIAGNOSIS_EDIT,
} from '../actions/types';

const INITIAL_STATE = {
    data: [],
};

export default function(state=INITIAL_STATE, action) {
    switch(action.type) {
        case DIAGNOSIS_ADD:
            const { data } = state;
            return {...INITIAL_STATE, data};
        case DIAGNOSIS_FETCH:
            return {...INITIAL_STATE, data: action.payload };
        default:
            return state;
    }
}
