import { combineReducers } from 'redux';
import auth from './auth_reducers';
import patient from './patient_reducers';
import diagnosis from './diagnosis_reducers';
import medication from './medication_reducers';
import doctor from './doctor_reducers';
import common from './common_reducers';
import profile from './profile_reducers';
import summary from './settings_reducers';
import chat from './chat_reducers';
import calendar from './calendar_reducers';

export default combineReducers ({
    auth,
    patient,
    diagnosis,
    medication,
    doctor,
    common,
    profile,
    summary,
    chat,
    calendar,
});