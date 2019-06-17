import {
  ATTEMPT,
  SUCCESS,
  FAIL,
  MEDICATION_FETCH,
} from './types';
import firebase from 'react-native-firebase';

import { Translations } from '../../constants/Translations';

export const fetch_medications = (callback) => async (dispatch) => {
  const user = firebase.auth().currentUser;
  try {
    await firebase.database().ref(`users/${user.uid}/Medications`).on('value', (snapshot) => {
      let data = [];
      snapshot.forEach(function (childSnapshot) {
        // key will be "ada" the first time and "alan" the second time
        var key = childSnapshot.key;
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();
        var medication = { key, ...childData };
        data.push(medication);
      });
      callback(data);
    });
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
  }
};

export const save_medication = (medication) => async (dispatch) => {
  const { key, ...newmedication } = medication;
  const user = firebase.auth().currentUser;

  console.log("the medication to be not saved is", medication);
  console.log("the medication to be saved is", newmedication);

  if (key) {
    // Update existing medication
    try {
      await firebase.database().ref(`users/${user.uid}/Medications/${key}`).update(newmedication);
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      throw new Error(errorMessage);
    }
  } else {
    // Adding new medication
    try {
      const myRef = await firebase.database().ref(`users/${user.uid}/Medications`).push();
      const key = myRef.key;
      await myRef.set(medication);
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      throw new Error(errorMessage);
    }
  }

};

export const delete_medication = (medication) => async (dispatch) => {
  const { key } = medication;
  const user = firebase.auth().currentUser;
  console.log("delete_medication received:", medication);
  try {
    await firebase.database().ref(`users/${user.uid}/Medications/${key}`).remove();
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
  }
};

