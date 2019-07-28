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
    return dispatch({ type: FAIL, payload: errorMessage });
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

export const fetch_requests = (callback) => async (dispatch) => {
  console.log("LOG1");
  const { _user } = firebase.auth().currentUser;
  console.log("LOG", _user.uid);
  var url = `providers/${_user.uid}/newRequests`;
  await firebase.database().ref(url).on('value', (snapshot) => {
    const newRequests = snapshot.val();
    console.log("LOG", newRequests);
    callback(newRequests);
  })
}

export const saveQuestions = (questionArray) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  var url = `providers/${_user.uid}/questions`;
  firebase.database().ref(url).set(questionArray);
}

export const fetchQuestions = (callback) => async (dispatch) => {
  console.log("Fetch");
  const { _user } = firebase.auth().currentUser;
  var url = `providers/${_user.uid}/questions`;
  await firebase.database().ref(url).on('value', (snapshot) => {
    var questionArray = snapshot.val();
    console.log("Question array", questionArray);
    callback(questionArray);
  });
}

// this function is called by caregive
export const fetchDoctorQuestions = (providerID, callback) => async (dispatch) => {
  console.log("Fetch");
  var url = `providers/${providerID}/questions`;
  await firebase.database().ref(url).on('value', (snapshot) => {
    var questionArray = snapshot.val();
    console.log("Question array", questionArray);
    callback(questionArray);
  });
}

export const fetchDoctorAnswers = (providerID, caregiverID, callback) => async (dispatch) => {
  var answerURL = `providers/${providerID}/chats/${caregiverID}/answers`;
  var questionURL = `providers/${providerID}/questions`;

  console.log("P ", providerID, " C ", caregiverID);
  await firebase.database().ref(questionURL).on('value', async (snapshot) => {
    var questions = [];
    questions = snapshot.val();
    var questionArray = questions;
    console.log("Questions", questions);
    if (questions) {
      await firebase.database().ref(answerURL).on('value', answerSnapshot => {
        var answers = [];
        answers = answerSnapshot.val();
        console.log("Answers", answers);
        var answerArray = [];
        if (answers) {
          for (var i = 0; i < questions.length; i++) {
            answers.forEach(answer => {
              if (answer.id == i) {
                if (answer[i] == undefined)
                  answerArray[i] = answer.answer;
                else
                  answerArray[i] = answerArray[i] + ' ' + answer.answer;
              }
            })
          }
          for (var i = 0; i < answerArray.length; i++) {
            if (!answerArray[i])
              answerArray[i] = 'Yanıt Yok!'
          }
        } else {
          for (var i = 0; i < questions.length; i++) {
            answerArray[i] = 'Yanıt Yok!'
          }
        }

        callback({ questionArray, answerArray, noQuestion: false })
      })
    } else {
      callback({ noQuestion: true })
    }
  })

}
export const fetchChatSettings = (callback) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;
  const caregiverURL = `providers/${uid}/chats`;
  await firebase.database().ref(caregiverURL).on('child_added', async (caregiverSnapshot) => {
    var caregiverID = caregiverSnapshot.key;
    var caregiver = caregiverSnapshot.val();
    if (caregiverID !== 'commonchat') {
      var fee = caregiver.fee;
      const profileURL = `users/${caregiverID}/profile`;
      await firebase.database().ref(profileURL).on('value', async (userSnap) => {
        const user = userSnap.val();
        console.log("user", user);
        const { displayName, photoURL } = user;
        var finalUser = {};
        finalUser.displayName = displayName;
        finalUser.photoURL = photoURL;
        finalUser.fee = fee;
        finalUser.id = caregiverID;
        console.log("New C", finalUser);
        callback(finalUser);
      });
    }
  })
}

export const fetchGeneralFee = (callback) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;
  const generalFeeUrl = `providers/${uid}/generalFee`;
  await firebase.database().ref(generalFeeUrl).on('value', fee => {
    const generalFee = fee.val();
    callback(generalFee);
  })
}

export const setChatSettings = (caregivers) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;
  const providerURL = `providers/${uid}/chats`;
  caregivers.forEach(async (caregiver) => {
    const caregiverID = caregiver.id;
    const caregiverURL = providerURL + `/${caregiverID}/fee`;
    await firebase.database().ref(caregiverURL).set(caregiver.fee);
  })
}

export const setGeneralFee = (generalFee) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;
  const generalFeeUrl = `providers/${uid}/generalFee`;
  await firebase.database().ref(generalFeeUrl).set(generalFee);
}

function getUser() {
  const user = firebase.auth().currentUser;
  return user;
}