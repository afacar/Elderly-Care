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
      console.error("GogleSingin Some unkown error:", error.code, error.message);
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

export const createNewUserProfile = (userRole, userName) => async (dispatch) => {
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

  let urlPrefix = `caregivers`;
  if (userRole === 'p') urlPrefix = 'providers';

  try {
    // Add user to common chat 
    await firebase.database().ref(`${urlPrefix}/${uid}/chats/commonchat/`).set(true);
    await firebase.database().ref(`commonchat/members/${uid}/`).set(true);
    console.log("commonchat membership is set to true for new user");
  } catch (error) {
    console.log("yeni kullanıcı commonchat'e eklenirken hata:", error.message);
  }

  try {
    // create user profile
    const profile = {
      photoURL: photoURL || '',
      displayName: displayName || '',
      email: email || '',
      photoURL: photoURL || '',
      phoneNumber: phoneNumber || '',
      userRole: userRole
    };
    await firebase.database().ref(`users/${uid}/profile/`).set(profile);
    console.log("profile is created for new user");
  } catch (error) {
    console.log("yeni kullanıcı için profil oluşturulurken hata:", error.message);
  }

};

export const fetch_profile = (callback, role = '') => async (dispatch) => {
  // Check if profile exist for current user and user type
  // Fetch user object and extra profile information and return them as a single object
  const { _user } = firebase.auth().currentUser;
  const url = `users/${_user.uid}/profile`;

  try {
    await firebase.database().ref(url).once('value', async (snapshot) => {
      let profile = snapshot.val();
      //profile = { ...profile, ..._user };
      await firebase.database().ref(`users/${_user.uid}/wallet`).on('value', (snap) => {
        const wallet = snap ? snap.val() : 0;
        console.log("returning profile with callback", profile);
        callback({ ...profile, wallet});
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
  firebase.auth().currentUser.updateProfile({ displayName });
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
