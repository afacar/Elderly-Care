import {
  CLEAR,
  EDIT,
  MODAL,
} from './types';
import firebase from 'react-native-firebase';

export const clear = () => async (dispatch) => {
  return dispatch({ type: CLEAR });
};

export const fill_edit_form = (item) => (dispatch) => {
  dispatch({ type: EDIT, payload: item });
};

export const modal_visibility = (visibility) => (dispatch) => {
  dispatch({ type: MODAL, payload: visibility });
}

/** 
 * Caregivers function for listing, adding Provider requests
 */
export const fetch_providers = (callback) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;

  console.log('fetching providers...');

  let url = `providers/members/`;
  try {
    await firebase.database().ref(url).on('value', async (snapshot) => {
      console.log('snapshot of providers/members', snapshot.val());
      snapshot.forEach(async (snap) => {
        const providerId = snap.key;
        const isActive = snap.val();
        if (providerId && isActive) {
          try {
            await firebase.database().ref(`caregivers/${_user.uid}/chats/${providerId}/status`).orderByValue().on('value', async snap => {
              let isApproved = snap.val();

              try {
                await firebase.database().ref(`users/${providerId}/profile`).on('value', async profileSnap => {
                  const provider = profileSnap.val();
                  console.log('Provider profile is fetched!', provider);
                  if (provider) callback({ ...provider, providerId, isApproved });
                });
              } catch (error) {
                console.error('error while providers profile!', error.message);
              }

            });
          } catch (error) {
            console.error('error while caregivers providers!', error.message);
          }
        }

      });
    });
  } catch (error) {
    console.error('error while fetching providers/members!', error.message);
  }

}

export const send_provider_request = (providerId) => async (dispatch) => {
  console.log('send_provider_request is called with providerId', providerId);
  const { _user } = firebase.auth().currentUser;
  const caregiverurl = `caregivers/${_user.uid}/chats/${providerId}/status`;
  const providerurl = `providers/${providerId}/chats/${_user.uid}/status`;
  const providerRequestUrl = `providers/${providerId}/newRequests`;
  try {
    // null means pending
    await firebase.database().ref(caregiverurl).set('pending');
    await firebase.database().ref(providerurl).set('pending');
    await firebase.database().ref(providerRequestUrl).transaction(function (value) {
      return (value || 0) + 1;
    })
  } catch (error) {
    console.error('Error while adding provider', error.message);
  }

}

export const cancel_pending_request = (providerId) => async (dispatch) => {
  console.log('cancel_pending_request is called with providerId', providerId);
  const { _user } = firebase.auth().currentUser;
  const caregiverurl = `caregivers/${_user.uid}/chats/${providerId}/status`;
  const providerurl = `providers/${providerId}/chats/${_user.uid}/status`;
  const providerRequestUrl = `providers/${providerId}/newRequests`;

  try {
    // Cancel the pending request to Provider
    await firebase.database().ref(caregiverurl).set(null);
    await firebase.database().ref(providerurl).set(null);
    await firebase.database().ref(providerRequestUrl).transaction(function (value) {
      return value - 1;
    })
  } catch (error) {
    console.error('Error while adding provider', error.message);
  }

}

/** 
 * Providers function for listing, approving and canceling caregivers requests
 */
export const respond_caregiver_request = (caregiverId, answer) => async (dispatch) => {
  /**
   * answer can be 
   * true for approving request
   * false for rejecting request
   * 'pause' for pausing 
   */
  var tmpAnswer = answer;
  if (answer == 'start')
    answer = true
  console.log('approve_caregiver_request is called with caregiverId', caregiverId);
  const { _user } = firebase.auth().currentUser;
  const caregiverurl = `caregivers/${caregiverId}/chats/${_user.uid}/status`;
  const providerurl = `providers/${_user.uid}/chats/${caregiverId}/status`;
  const providerRequestUrl = `providers/${_user.uid}/newRequests`;

  try {
    // Confirm the pending request to Provider
    await firebase.database().ref(caregiverurl).set(answer);
    await firebase.database().ref(providerurl).set(answer);
    if (tmpAnswer !== 'pause' && tmpAnswer !== 'start') {
      await firebase.database().ref(providerRequestUrl).transaction(function (value) {
        return value - 1;
      })
    }
  } catch (error) {
    console.error('Error while approving caregiver', error.message);
  }

}

export const fetch_caregivers = (callback) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  const url = `providers/${_user.uid}/chats/`;
  try {
    await firebase.database().ref(url).on('value', async (snapshot) => {
      snapshot.forEach((snap) => {
        const caregiverId = snap.key;
        const { status } = snap.val();
        if (caregiverId && caregiverId !== 'commonchat') {
          firebase.database().ref(`users/${caregiverId}/profile/`).on('value', async (profileSnap) => {
            const caregiver = profileSnap.val();
            callback({ ...caregiver, caregiverId, status });
          });
        }
      });
    })
  } catch (error) {
    console.error('fetch_caregivers hata:', error.message);
  }

}