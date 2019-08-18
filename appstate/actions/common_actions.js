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

export const send_provider_request = (providerId, providerFee, callback) => async (dispatch) => {
  console.log('1 send_provider_request is called with providerId', providerId);
  const { uid, photoURL, displayName } = firebase.auth().currentUser;
  console.log('provider profile fetching...');
  let provider = await getUserProfile(providerId);
  console.log('provider profile fetched', provider);

  const request = {};

  const firstMessage = {
    status: 'Pending',
    firstTime: true,
    lastMessage: {
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      text: '',
      user: {
        _id: uid,
        avatar: photoURL,
        name: displayName,
      }
    }
  }

  request[`caregivers/${uid}/chats/${providerId}/`] = { ...firstMessage, title: provider.displayName, avatar: provider.photoURL };
  request[`providers/${providerId}/chats/${uid}/`] = { ...firstMessage, title: displayName, avatar: photoURL };
  request[`pendingTransactions/${uid}/${providerId}/`] = { providerFee, status: 'Pending' };

  const caregiverWalletUrl = `wallets/${uid}/`;
  await firebase.database().ref(caregiverWalletUrl).once('value', async (walletSnap) => {
    let wallet = walletSnap.val() ? walletSnap.val() : 0;
    console.log('2 send_provider_request wallet balance=>', wallet);

    if (wallet >= providerFee) {
      try {
        console.log('3 send_provider_request wallet is enough');
        const providerRequestUrl = `providers/${providerId}/newRequests`;
        await firebase.database().ref(providerRequestUrl).transaction((value) => { return (value || 0) + 1; });
        await firebase.database().ref().update(request);
        console.log('4 send_provider_request providerFee is transfered to pendingTransactions');
        callback("success");
      } catch (error) {
        console.error('5 send_provider_request Error while sending to provider', error.message);
        callback("failure");
      }
    } else {
      callback("failure");
    }
  })
}

export const cancel_pending_request = (providerId) => async (dispatch) => {
  console.log('cancel_pending_request is called with providerId', providerId);
  const uid = firebase.auth().currentUser.uid;

  const request = {};
  request[`caregivers/${uid}/chats/${providerId}/status`] = 'Cancel';
  request[`providers/${providerId}/chats/${uid}/status`] = 'Cancel';
  request[`pendingTransactions/${uid}/${providerId}/status`] = 'Cancel';

  //const pendingTransactionUrl = `pendingTransactions/${uid}/${providerId}/`;
  const providerRequestUrl = `providers/${providerId}/newRequests`;

  try {
    // Cancel the pending request to Provider
    await firebase.database().ref().update(request);
    await firebase.database().ref(providerRequestUrl).transaction((value) => { return value - 1; })
  } catch (error) {
    console.error('Error while canceling request', error.message);
  }

}

/** 
 * Providers function for listing, approving and canceling caregivers requests
 */
export const respond_caregiver_request = (caregiverId, answer) => async (dispatch) => {
  /**
   * answer can be 
   * Approve: for approving request
   * Reject: for rejecting request
   * End: ending session 
   */

  console.log('respond_caregiver_request is called with caregiverId and answer', caregiverId, answer);

  const { _user } = firebase.auth().currentUser;

  request = {};

  request[`caregivers/${caregiverId}/chats/${_user.uid}/status`] = answer;
  request[`providers/${_user.uid}/chats/${caregiverId}/status`] = answer;
  request[`pendingTransactions/${caregiverId}/${_user.uid}/status`] = answer;

  try {
    // Confirm the pending request to Provider
    await firebase.database().ref().update(request);
    var providerRequestUrl = `providers/${_user.uid}/newRequests`;
    await firebase.database().ref(providerRequestUrl).transaction(function (value) {
      if (value > 0) return value - 1;
    });
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

export const setIBAN = (IBAN) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  const url = `users/${_user.uid}/profile/IBAN`;
  firebase.database().ref(url).set(IBAN);
}

export const getIBAN = (callback) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  const url = `users/${_user.uid}/profile/IBAN`;
  firebase.database().ref(url).once('value', (snapshot) => {
    const IBAN = snapshot.val();
    callback(IBAN);
  });
}

const getUserProfile = async (uid) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref(`users/${uid}/profile`).once('value', snap => {
      snap.val() ? resolve(snap.val()) : reject('No such user or profile');
    })
  })
}

const readFromFirebase = (url) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref(url).on('value', snap => {
      resolve(snap.val());
    }, error => {
      reject('readFromFirebase Error:' + error.message)
    })
  })
}


export const getBalance = (callback) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  const url = `wallets/${_user.uid}/`;
  firebase.database().ref(url).once('value', (snapshot) => {
    var balance = 0;
    if (snapshot)
      balance = snapshot.val();
    callback(balance);
  });
}