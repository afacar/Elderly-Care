import {
  ATTEMPT,
  FAIL,
  SUCCESS,
  DIAGNOSIS_FETCH,
  DIAGNOSIS_EDIT,
} from './types';
import firebase from 'react-native-firebase';

import { Translations } from '../../constants/Translations';


export const fetch_diagnosis = (callback) => async (dispatch) => {
  const user = getUser();
  try {
    await firebase.database().ref(`users/${user.uid}/DiagnosisInfo`).on('value', (snapshot) => {
      let data = [];
      snapshot.forEach(function (childSnapshot) {
        // key will be "ada" the first time and "alan" the second time
        var key = childSnapshot.key;
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();
        var diagnosis = { key, ...childData };
        data.push(diagnosis);
      });
      callback(data);
    });
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
  }
};

export const save_diagnosis = (diagnosis) => async (dispatch) => {
  const user = getUser();
  const { key } = diagnosis;
  if (!key) {
    try {
      // Adding new diagnosis
      let myRef = await firebase.database().ref(`users/${user.uid}/DiagnosisInfo`).push();
      const key = myRef.key;
      await myRef.set(diagnosis);
      //let key = await firebase.database().ref(`users/${user.uid}/DiagnosisInfo`).push({ name, level, firstDiagnosisDate, notes });
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      throw new (errorMessage);
    }
  } else {
    try {
      // Updating existing diagnosis
      await firebase.database().ref(`users/${user.uid}/DiagnosisInfo/${key}`).update(diagnosis);
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      throw new Error(errorMessage);
    }
  }
};

export const delete_diagnosis = (diagnosis) => async (dispatch) => {
  const { key } = diagnosis;
  const user = getUser();
  try {
    await firebase.database().ref(`users/${user.uid}/DiagnosisInfo/${key}`).remove();
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
  }
};

function getUser() {
  return firebase.auth().currentUser;
}