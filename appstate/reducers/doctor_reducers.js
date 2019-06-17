import {
    DOCTOR_FETCH,
} from '../actions/types';

const INITIAL_STATE = {
    name: '',
    specialty: '',
    phone: '',
    email: '',
    address: '',
    appointment: '',
};

export default function(state=INITIAL_STATE, action) {
    switch(action.type) {
        case DOCTOR_FETCH:
            return {...action.payload};
        default:
            return state;
    }
}