import {
  PATIENT_FETCH,
  ATTEMPT,
  FAIL,
  SUCCESS
} from './types';
import firebase from 'react-native-firebase';

import { Translations } from '../../constants/Translations';

export const fetch_patient = (callback, userid='') => async (dispatch) => {
  let uid = userid;
  if(!uid) uid = firebase.auth().currentUser.uid;
  console.log('fetch_patient for uid', uid);
  try {
    await firebase.database().ref(`users/${uid}/PatientInfo`).on('value', (snapshot) => {
      let patient = snapshot.val();
      if(!patient) patient={};
      callback(patient);
    });
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
  }
};

export const save_patient = (patient) => async (dispatch) => {
  const user = firebase.auth().currentUser;
  try {
    await firebase.database().ref(`users/${user.uid}/PatientInfo`).update(patient);
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
  }
};
