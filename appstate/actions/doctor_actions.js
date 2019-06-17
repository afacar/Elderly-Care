import {
    DOCTOR_FETCH,
    ATTEMPT,
    SUCCESS,
    FAIL
} from './types';
import firebase from 'react-native-firebase';

import { Translations } from '../../constants/Translations';

export const fetch_doctor = () => async (dispatch) => {
    const user = getUser();
    dispatch({ type: ATTEMPT });
    try {
        await firebase.database().ref(`users/${user.uid}/DoctorInfo`).on('value', (snapshot) => {
            const doctor = snapshot.val();
            if (doctor) {
                dispatch({ type: SUCCESS });
                return dispatch({ type: DOCTOR_FETCH, payload: doctor });
            } else {
                dispatch({ type: SUCCESS });
                return dispatch({ type: DOCTOR_FETCH, payload: {} });
            }
        });
    } catch (error) {
        const errorMessage = Translations[error.code] || error.message;
        return dispatch({type: FAIL, payload: errorMessage });
    }
};

export const save_doctor = (doctor) => async (dispatch) => {
    if (!doctor.name) {
        return dispatch({ type: FAIL, payload: "Lütfen doktorun adını girin!" });
    }
    const user = getUser();
    dispatch({ type: ATTEMPT });
    try {
        await firebase.database().ref(`users/${user.uid}/DoctorInfo`).update(doctor);
        dispatch({ type: SUCCESS, payload: "Doktor bilgisi güncellendi!" });
    } catch (error) {
        const errorMessage = Translations[error.code] || error.message;
        return dispatch({ type: FAIL, payload: errorMessage });        
    }
};

export const fetch_contacts = (callback) => async (dispatch) => {
    // Check if profile exist for current user and user type
    // Fetch user object and extra profile information and return them as a single object
    const { _user } = firebase.auth().currentUser;
    let url = `providers/${_user.uid}/caregivers`;
    console.log('url for fetch_contacts is:', url);
    try {
      await firebase.database().ref(url).on('child_added', (snapshot) => {
        console.log("fetch_contacts child_added:", snapshot.val());
        const contact = snapshot.val(); /** contact = { Approved: true, lastMessage: m1 } */
        const c_id = snapshot.key; // uid of caregiver
        if (contact && c_id) {
          callback({ ...contact, c_id });
        } else {
          console.log('contact veya c_id missing :', contact, c_id);
        }
      });
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      console.log('Error while fetch_contacts', errorMessage);
      throw new Error(errorMessage);
    }
  
    try {
      await firebase.database().ref(url).on('child_changed', (snapshot) => {
        console.log("fetch_contacts child_changed:", snapshot.val());
        const contact = snapshot.val(); /** contact = { Approved: true, lastMessage: m1 } */
        const c_id = snapshot.key; // uid of caregiver
        if (contact && c_id) {
          callback({ ...contact, c_id });
        } else {
          console.log('contact veya contactId missing :', contact, c_id);
        }
      });
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      console.log('Error while fetch_contacts', errorMessage);
      throw new Error(errorMessage);
    }
  };

function getUser(){
    const user = firebase.auth().currentUser;
    return user;
}