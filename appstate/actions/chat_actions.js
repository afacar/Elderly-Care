import {
  CHATS_FETCH,
  ROOMS_FETCH,
  ATTEMPT,
  SUCCESS,
  FAIL,
  CHATS_AUDIO,
} from './types';
import firebase from 'react-native-firebase';
import { getUserRole } from './auth_actions';
import { AsyncStorage } from 'react-native';
import { Translations } from '../../constants/Translations';
import Sound from "react-native-sound";



// retrieve the messages from the Backend
export const fetchMessages = (userRole, localMessageIds, chatId, callback) => async (dispatch) => {
  // FIX: fetch messages and chatURL based on userRole

  const uid = firebase.auth().currentUser.uid;
  // make url based on chatIds
  let chatUrl = '';
  if (chatId == 'commonchat') {
    chatUrl = `commonchat/messages`;
  } else if (userRole === 'c') {
    chatUrl = `providerchat/${chatId}/${uid}/messages`;
  }
  else if (userRole === 'p') {
    chatUrl = `providerchat/${uid}/${chatId}/messages`;
  }
  // fet
  try {
    await firebase.database().ref(chatUrl).orderByChild('createdAt').limitToLast(25).on('child_added', (snapshot, prevChildKey) => {
      const key = snapshot.key;

      try {
        const message = snapshot.val();
        console.log('fetch_message got new message=>', message);

        const newMessage = {
          _id: key,
          audio: message.audio,
          text: message.text,
          image: message.image,
          createdAt: message.createdAt,
          user: {
            _id: message.user._id,
            name: message.user.name,
            avatar: message.user.avatar,
          },
        };

        if (userRole === 'c') {
          firebase.database().ref(`caregivers/${uid}/chats/${chatId}/unread`).set(0);
        }
        else if (userRole === 'p') {
          firebase.database().ref(`providers/${uid}/chats/${chatId}/unread`).set(0);
        }
        callback(newMessage);
        // }
        // });
      } catch (error) {
        console.error(`${chatId} ait local data okunurken data`, error.message);
      }
    });
  } catch (error) {
    console.error("fetchMessages error:", error);
    throw new Error(error.message);
  }

}

// send the message to the Backend
export const sendMessage = (userRole, messages, chatId) => async (dispatch) => {
  console.log("sendMessage 3", userRole, messages, chatId);
  const uid = firebase.auth().currentUser.uid;
  let url = '';
  let unreadURL = '';
  var downloadUrl = '';
  var uploadUrl = '';
  var audioUrl = '';
  var audioDownloadUrl = '';
  let messagesURL = '';
  let theMessage = {};

  for (let i = 0; i < messages.length; i++) {
    let message = messages[i];
    if (chatId === 'commonchat') {
      url = 'commonchat/';
      messagesURL = url + 'messages/' + message._id;

      if (message.image) {
        uploadUrl = "chatFiles/commonchat/image";
      } else if (message.audio) {
        audioUrl = 'chatFiles/commonchat/audio';
      }

    } else if (userRole === 'c') {
      url = `providerchat/${chatId}/${uid}/`;
      unreadURL = `providers/${chatId}/chats/${uid}/unread`;
      messagesURL = url + 'messages/' + message._id;

      if (message.image) {
        uploadUrl = `chatFiles/${chatId}/${uid}/image`;
      } else if (message.audio) {
        audioUrl = `chatFiles/${chatId}/${uid}/audio`;
      }

    } else if (userRole === 'p') {
      url = `providerchat/${uid}/${chatId}/`;
      unreadURL = `caregivers/${chatId}/chats/${uid}/unread`;
      messagesURL = url + 'messages/' + message._id;

      if (message.image) {
        uploadUrl = `chatFiles/${uid}/${chatId}/image`;
      } else if (message.audio) {
        audioUrl = `chatFiles/${uid}/${chatId}/audio`;
      }
    }

    if (uploadUrl) {
      await firebase.storage().ref(uploadUrl).child(message._id).putFile(message.path);
      downloadUrl = await firebase.storage().ref(uploadUrl).child(message._id).getDownloadURL();
    }
    if (audioUrl) {
      var metadata = {
        contentType: 'audio/mp3',
      };
      await firebase.storage().ref(audioUrl).child(message._id).putFile(message.audioPath, metadata);
      audioDownloadUrl = await firebase.storage().ref(audioUrl).child(message._id).getDownloadURL();
    }

    console.log(`sendMessage will send message to ${url} with chatID (${chatId}) and uid (${uid})`);
    //const messagesURL = url + 'messages/' + message._id;
    console.log(`sendMessage will be pushed to messagesURL=>`, messagesURL);
    // It was all beacause of this line
    console.log(downloadUrl.toString());

    var messageData = {
      user: message.user,
      createdAt: message.createdAt,
      image: downloadUrl,
      text: message.text,
      audio: audioDownloadUrl
    };


    if (chatId !== 'commonchat') {
      console.log('unread fetching...');
      let unread = await readFromFirebase(unreadURL);
      console.log('unread fetched', unread);
      theMessage[unreadURL] = (unread || 0) + 1;
    }

    theMessage[messagesURL] = messageData;

    if (chatId === 'commonchat') {
      theMessage[`commonchat/lastMessage`] = messageData;
    } else if (userRole === 'c') {
      theMessage[`providers/${chatId}/chats/${uid}/lastMessage`] = messageData;
      theMessage[`caregivers/${uid}/chats/${chatId}/lastMessage`] = messageData;
    }
    else if (userRole === 'p') {
      theMessage[`providers/${uid}/chats/${chatId}/lastMessage`] = messageData;
      theMessage[`caregivers/${chatId}/chats/${uid}/lastMessage`] = messageData;
    }

    console.log('theMessage before update =>', theMessage);
    //messagesRef.set(messageData);
    // Multiple update for the message
    let ref = firebase.database().ref();
    ref.update(theMessage, error => { console.log('lastMessage set error', error) });
  }
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

// close the connection to the Backend
export const closeChat = (chatId, userRole) => async () => {
  const uid = firebase.auth().currentUser.uid;
  let url = ``;
  if (chatId === 'commonchat') {
    url = `commonchat/messages/`;
  } else if (userRole === 'c' && uid) {
    url = `providerchat/${chatId}/${uid}/messages`;
    console.log("we are closing message connection from:", url);
  } else if (userRole === 'p' && uid) {
    url = `providerchat/${uid}/${chatId}/messages`;
    console.log("we are closing message connection from:", url);
  } else {
    console.log("we are not closing any message given connection chatId and uid:", chatId, uid);
  }

  const messagesRef = firebase.database().ref(url);
  messagesRef.off();
}

// load chat rooms for the current Caregiver
export const loadCaregiverChats = (callback) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;

  await firebase.database().ref(`caregivers/${uid}/chats/`).on('value', async (snapshot) => {
    snapshot.forEach(async (snap) => {
      const chatId = snap.key;
      let { status, unread, firstTime, lastMessage, title, avatar } = snap.val();
      console.log(`loadCaregiverChats snapshot => `, snapshot.val());

      if (chatId && chatId !== 'commonchat') {
        title = title || 'isim yok';
        avatar = avatar ? { uri: avatar } : require('../../assets/images/user.png');
        callback({ chatId, title, lastMessage, status, unread, avatar, firstTime });
      } else if (chatId === 'commonchat') {
        await firebase.database().ref(`commonchat/lastMessage/`).on('value', async (commonsnap) => {
          lastMessage = commonsnap.val();
          if (lastMessage) {
            title = title || 'Alzheimer grubu';
            avatar = await require('../../assets/images/groupchat.png');
            callback({ chatId, title, lastMessage, status, unread, avatar, firstTime });
          }
        });
      }

    });
  });

}

// load chat rooms for the current Provider
export const loadProviderChats = (callback) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;

  await firebase.database().ref(`providers/${uid}/chats/`).on('value', async (snapshot) => {
    console.log('loadProviderChats snapshot', snapshot.val());
    snapshot.forEach(async (snap) => {
      const chatId = snap.key;
      let { status, unread, firstTime, isArchived, lastMessage, title, avatar } = snap.val();

      if (chatId && chatId !== 'commonchat') {
        title = title || 'isim yok';
        avatar = avatar ? { uri: avatar } : require('../../assets/images/user.png');
        callback({ chatId, title, lastMessage, status, unread, avatar, firstTime });
      } else if (chatId === 'commonchat') {
        await firebase.database().ref(`commonchat/lastMessage/`).on('value', async (commonsnap) => {
          lastMessage = commonsnap.val();
          if (lastMessage) {
            title = title || 'Alzheimer grubu';
            avatar = await require('../../assets/images/groupchat.png');
            callback({ chatId, title, lastMessage, status, unread, avatar, firstTime });
          }
        });
      }

    });
  });

}

export const loadProviderArchives = (callback) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;

  await firebase.database().ref(`providers/${uid}/chats/`).on('value', async (snapshot) => {
    console.log('loadProviderChats snapshot', snapshot.val());
    snapshot.forEach(async (snap) => {
      const chatId = snap.key;
      const { status, unread, isArchived } = snap.val();
      console.log(`chatId:${chatId}'s status: ${status} for provider: ${uid} `);

      let url = 'commonchat/lastMessage';
      let title = 'Alzheimer grubu';
      let avatar = require('../../assets/images/groupchat.png');

      if (chatId) {
        if (chatId !== 'commonchat') {
          url = `providerchat/${uid}/${chatId}/lastMessage`;
          try {
            // chatId is a caregiver id, so fetch the displayName as title
            await firebase.database().ref(`users/${chatId}/profile/`).once('value', snapshot => {
              const profile = snapshot.val();
              const { photoURL, displayName } = profile;
              title = displayName || 'İsimsiz Uzman';
              avatar = photoURL ? { uri: photoURL } : require('../../assets/images/user.png');
            });
          } catch (error) {
            console.error(`provider displayName url (${url}) okunurken hata:`, error.message);
          }
        }

        try {
          await firebase.database().ref(url).on('value', (snapshot) => {
            console.log('last common message changed', snapshot.val());
            if (isArchived)
              callback({ chatId, title, avatar });
          });
        } catch (error) {
          console.error('Chat son mesajı okunurken hata oldu', error.message);
        }

      }

    });
  });
}

// load currently playing chat audio
export const setAudio = (id) => async (dispatch) => {
  return dispatch({ type: CHATS_AUDIO, payload: { id } })
}

export const sendAnswers = (answers, providerID) => async (dispatch) => {
  console.log("Answers", answers)
  const uid = firebase.auth().currentUser.uid;
  const completedPrelimURL = `providers/${providerID}/chats/${uid}`;
  firebase.database().ref(completedPrelimURL).child("completedPrelim").set(true);
  firebase.database().ref(completedPrelimURL).child("firstTime").set(false);
  firebase.database().ref(`caregivers/${uid}/chats/${providerID}`).child("firstTime").set(false);
  firebase.database().ref(completedPrelimURL).child("answers").set(answers);
}