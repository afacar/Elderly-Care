import {
    PATIENT_FETCH,
} from '../actions/types';

const INITIAL_STATE = {
    name: '',
    birthdate: '01-01-1955',
    gender: 'K',
    bloodtype: '',
    relation: 'other',
};

export default function(state=INITIAL_STATE, action) {
    switch(action.type) {
        case PATIENT_FETCH:
        return {...action.payload };
        default:
            return state;
    }
}