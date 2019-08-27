import {
  LOGIN,
  ATTEMPT,
  SUCCESS,
  FAIL,
} from './types';
import { NetInfo, AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';
import { LoginManager } from 'react-native-fbsdk';
import { GoogleSignin, statusCodes } from 'react-native-google-signin';

import { Translations } from '../../constants/Translations';


const configuration = require('../../android/app/google-sign_in-configure.json');

/* export const autoLogin = (user) => (dispatch) => {
  return dispatch({ type: LOGIN, payload: user });
} */

export const loginWithGoogle = () => async (dispatch) => {
  let isConnected = await NetInfo.isConnected.fetch();
  if (!isConnected) throw new Error("İnternet bağlantısı yok!");

  try {
    //await GoogleSignin.hasPlayServices();
    // Add any configuration settings here:
    console.log('googlesignin.configure()?')
    GoogleSignin.configure(configuration.configure);
    console.log('google.signin()?')
    const data = await GoogleSignin.signIn();
    // console.log("data from GoogleSignin", data);
    // create a new firebase credential with the token
    console.log('data?', data)
    const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken)
    // login with credential
    console.log('credential?', credential)
    let currentUser = await firebase.auth().signInWithCredential(credential);
    console.log('currentUser?', currentUser)

    //console.info("curretUser info from firebase.auth()", JSON.stringify(currentUser.user.toJSON()));
    //dispatch({ type: LOGIN, payload: currentUser });
  } catch (error) {
    console.log('Google Error=>', error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
      throw new Error("Google girişi iptal edildi!");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (f.e. sign in) is in progress already
      console.log("in progess");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
      console.log("Play service NA");
      throw new Error("Play services NA");
    } else {
      // some other error happened
      console.error("GoogleSingin Some unkown error:", error.code, error.message);
      throw new Error("Some unkown error!");
    }
  }

}

export const loginWithFacebook = (data) => async (dispatch) => {
  let isConnected = await NetInfo.isConnected.fetch();

  if (!isConnected) throw new Error("İnternet bağlantısı yok!");
  // Handle this however fits the flow of your app
  if (!data) throw new Error('Facebookdan token alınamadı!');
  console.log('data', data);
  try {
    // create a new firebase credential with the token
    let credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
    console.log('credential', credential);
    // login with credential
    let currentUser = await firebase.auth().signInWithCredential(credential);
    console.log('currentUser', currentUser);
    isNewUser = currentUser.additionalUserInfo.isNewUser;
  } catch (error) {
    console.error(e);
    const errorMessage = Translations[error.message] || error.message;
    throw new Error(errorMessage);
  }

};

export const createNewUserProfile = (userRole, userName, profession, experience) => async (dispatch) => {
  // check newUSer
  if (userRole === 'p') {
    await firebase.auth().currentUser.updateProfile({ displayName: userName });
  }
  const { uid, displayName, photoURL, email, phoneNumber } = firebase.auth().currentUser;
  console.log('createNewUserProfile is called with uid', uid);
  console.log('createNewUserProfile userRole is', userRole);

  if (userRole !== 'p' && userRole !== 'c') {
    console.warn('wrong userRole parameter received->', userRole);
    throw new Error('Invalid userRole parameter to _createNewUserProfile: send p or c as userRole!');
  }

  if (phoneNumber) {
    let phoneNumberUrl = `phoneNumbers/${phoneNumber}`;
    await firebase.database().ref(phoneNumberUrl).set(phoneNumber);
  }

    // Prepare lastMessage
    const lastMessage = {
      text: `${displayName} sohbete katıldı.`,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      system: true,
      user: {
        _id: uid,
        name: displayName
      }
    }

    // Add user to common chat 
    const commonchat = {
      status: 'Approve',
      title: 'Alzheimer Sohbet Grubu',
    }

    // create user profile
    let profile = {
      photoURL: photoURL || '',
      displayName: displayName || '',
      profession: profession || '',
      experience: experience || '',
      email: email || '',
      photoURL: photoURL || '',
      phoneNumber: phoneNumber || '',
      userRole: userRole,
    };

    let urlPrefix = `caregivers`;
    if (userRole === 'p') {
      userRole.status == 'Pending'
      urlPrefix = 'providers';
      await firebase.database().ref(`${urlPrefix}/${uid}/generalFee`).set(0);
      profile.generalFee = 0;
    }

  try {
    console.log('Getting messageId from commonchat...');
    let messageId = await firebase.database().ref('commonchat/messages').push().key;
    console.log('Getting messageId from commonchat=>', messageId);

    const newUserProfile = {}

    newUserProfile[`${urlPrefix}/${uid}/chats/commonchat`] = commonchat
    newUserProfile[`commonchat/lastMessage`] = lastMessage
    newUserProfile[`commonchat/messages/${messageId}`] = lastMessage
    newUserProfile[`commonchat/members/${uid}/`] = true
    newUserProfile[`users/${uid}/profile/`] = profile
    //newUserProfile[`users/${uid}/wallet`] = 0
    
    await firebase.database().ref().update(newUserProfile);
  } catch (error) {
    console.log("yeni kullanıcı profili olustururken hata:", error.message);
  }

};

export const fetch_profile = (callback, role = '') => async (dispatch) => {
  // Check if profile exist for current user and user type
  // Fetch user object and extra profile information and return them as a single object
  const { _user } = firebase.auth().currentUser;
  const url = `users/${_user.uid}/profile`;

  try {
    await firebase.database().ref(url).on('value', async (snapshot) => {
      let profile = snapshot.val();
      //profile = { ...profile, ..._user };
      await firebase.database().ref(`wallets/${_user.uid}/`).on('value', (snap) => {
        console.log("snap", snap);
        console.log("snap val", snap.val());
        let wallet = 0;
        if (snap !== null && snap.val() !== null) {
          wallet = snap.val();
        }
        console.log("wallet", wallet);
        callback({ ...profile, wallet });
      });

      //return dispatch({ type: PROFILE_FETCH, payload: profile });
    });
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
  }
};

export const save_profile = (profile) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  const { displayName, photoURL, newPhoto, path, profession, experience } = profile;
  const url = `users/${_user.uid}/profile`;
  // First update displayName, email, photoURL, phoneNumber to _user
  // Then update gender, birthdate etc. to profile
  console.log('In save_profile and recieved..', profile);
  firebase.auth().currentUser.updateProfile({ displayName },{profession},{experience});
  if (newPhoto) {
    console.log("New photo")
    await firebase.storage().ref().child("profilePics").child(_user.uid).putFile(path);
    profile.photoURL = await firebase.storage().ref().child("profilePics").child(_user.uid).getDownloadURL();
    firebase.auth().currentUser.updateProfile({ photoURL: profile.photoURL });
    delete profile.path;
  }
  delete profile.newPhoto;
  delete profile.wallet;
  await firebase.database().ref(url).update(profile);
  console.log('save_profile is updated succesfully!', profile);
  console.log('save_profile is quiting...');
};

export const logout = () => async dispatch => {
  try {
    await firebase.auth().signOut();
    // Signout from FB LoginManager too!
    await LoginManager.logOut();
    // Clear local storage
    await AsyncStorage.clear();
    // dispatch null user
    //dispatch({ type: LOGIN, payload: null });
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
    //return dispatch({ type: FAIL, payload: errorMessage });
  }
};


export const getUid = () => dispatch => {
  return firebase.auth().currentUser.uid;
}

export const getName = () => dispatch => {
  return firebase.auth().currentUser.displayName || "Anonimis";
}

export const getPhotoURL = () => dispatch => {
  return firebase.auth().currentUser.photoURL || '';
}


export const getUserRole = (callback) => async (dispatch) => {
  let { uid } = firebase.auth().currentUser;

  let userRole = '';

  try {
    userRole = await AsyncStorage.getItem('Role');
  } catch (error) {
    console.log('user role localde okunurken hata!', error.message);
  }

  if (!userRole) {
    let url = `caregivers/members/${uid}`;
    try {
      userRole = await firebase.database().ref(url).once('value', snap => {
        if (snap.val()) return 'c';
      });
    } catch (error) {
      console.log('user role caregivers/members da okunurken hata!', error.message);
    }
  }

  if (!userRole) {
    let url = `providers/members/${uid}`;
    try {
      userRole = await firebase.database().ref(url).once('value', snap => {
        if (snap.val()) return 'p';
      });
    } catch (error) {
      console.log('user role providers/members da okunurken hata!', error.message);
    }
  }
  console.log('getUserRole returning userRole...', userRole);
  callback(userRole);
}

export const setUserRole = (userRole) => async (dispatch) => {
  let { uid } = firebase.auth().currentUser;

  if (!(userRole === 'p' || userRole === 'c')) {
    console.warn('wrong userRole parameter received->', userRole);
    throw new Error('Invalid userRole parameter: send p or c as userRole!->', userRole);
  }

  try {
    await AsyncStorage.setItem('Role', userRole);
    console.log('user role locale yazıldı.');
  } catch (error) {
    console.log('user role locale yazarken hata!', error.message);
  }

  let url = `caregivers/members/${uid}`;
  if (userRole === 'p') url = `providers/members/${uid}`;

  try {
    await firebase.database().ref(url).set(true);
    console.log('user role firebasede şuraya kaydedildi.', url);
  } catch (error) {
    console.log('user role firebase kaydederken hata:', error.message);
  }

}
