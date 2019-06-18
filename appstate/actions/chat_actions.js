import {
  CHATS_FETCH,
  ROOMS_FETCH,
  ATTEMPT,
  SUCCESS,
  FAIL,
} from './types';
import firebase from 'react-native-firebase';
import { getUserRole } from './auth_actions';
import { AsyncStorage } from 'react-native';

import { Translations } from '../../constants/Translations';

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
    await firebase.database().ref(`caregivers/${uid}/chats/${chatId}/unread`)
      .set(0);
  }
  else if (userRole === 'p') {
    chatUrl = `providerchat/${uid}/${chatId}/messages`;
    await firebase.database().ref(`providers/${uid}/chats/${chatId}/unread`)
      .set(0);
  }
  // fet
  try {
    await firebase.database().ref(chatUrl).limitToLast(25).on('child_added', (snapshot, prevChildKey) => {
      const key = snapshot.key;
      if (!localMessageIds.includes(key)) {
        const message = snapshot.val();
        //console.log("this message doesnt exist in local so fetched:", message);
        const newMessage = {
          _id: key,
          text: message.text,
          createdAt: new Date(message.createdAt),
          user: {
            _id: message.user._id,
            name: message.user.name,
            avatar: message.user.avatar,
          },
        };
        callback(newMessage, isNewMessage = true);
      }
    });
  } catch (error) {
    console.error("fetchMessages error:", error);
    throw new Error(error.message);
  }

}

// send the message to the Backend
export const sendMessage = (userRole, message, chatId) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;
  let url = `commonchat/`;
  if (chatId !== 'commonchat' && userRole === 'c') {
    url = `providerchat/${chatId}/${uid}/`;
    const unreadRef = firebase.database().ref(`providers/${chatId}/chats/${uid}/`);
    await unreadRef.child('unread').transaction((unread) => { return (unread || 0) + 1 });
  } else if (chatId !== 'commonchat' && userRole === 'p') {
    url = `providerchat/${uid}/${chatId}/`;
    const unreadRef = firebase.database().ref(`caregivers/${chatId}/chats/${uid}/`);
    await unreadRef.child('unread').transaction((unread) => { return (unread || 0) + 1 });
  }

  console.log(`sendMessage will send message to ${url} with chatID (${chatId}) and uid (${uid})`);
  const messagesRef = firebase.database().ref(url + 'messages');
  const lastMessageRef = firebase.database().ref(url + 'lastMessage');
  // It was all beacause of this line
  for (let i = 0; i < message.length; i++) {
    const messageData = {
      text: message[i].text,
      user: message[i].user,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    };
    messagesRef.push(messageData);
    lastMessageRef.update(messageData);
  }
}

// close the connection to the Backend
export const closeChat = (chatId, userRole) => () => {
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
  const uid = firebase.auth().currentUser._user.uid;

  await firebase.database().ref(`caregivers/${uid}/chats/`).on('value', async (snapshot) => {
    snapshot.forEach(async (snap) => {
      const chatId = snap.key;
      const { status, unread } = snap.val();
      console.log(`chatId:${chatId} is approved: ${status} for user: ${uid} `);

      /** Set url, title, avatar as if it is common chat */
      let url = 'commonchat/lastMessage';
      let title = 'Alzheimer grubu';
      let avatar = require('../../assets/images/family.png');

      if (chatId && status !== 'pending') {
        if (chatId !== 'commonchat') {
          // if it is not common chat, it is a provider chat 
          url = `providerchat/${chatId}/${uid}/lastMessage`;
          try {
            // So fetch the provider profile
            await firebase.database().ref(`users/${chatId}/profile/`).once('value', snapshot => {
              const profile = snapshot.val();
              const { photoURL, displayName } = profile;
              title = displayName || 'İsimsiz Uzman';
              avatar = photoURL ? { uri: photoURL } : require('../../assets/images/doctor.png');
            });
          } catch (error) {
            console.error(`provider profile url (${url}) okunurken hata:`, error.message);
          }
        }

        await firebase.database().ref(url).on('value', (snapshot) => {
          const lastMessage = snapshot.val() || '';
          callback({ chatId, title, lastMessage, status, avatar, unread });
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
        const { status, unread } = snap.val();
        console.log(`chatId:${chatId}'s status: ${status} for provider: ${uid} `);

        let url = 'commonchat/lastMessage';
        let title = 'Alzheimer grubu';
        let avatar = require('../../assets/images/family.png');

        if (chatId && status !== 'pending') {
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
              const lastMessage = snapshot.val() || '';
              callback({ chatId, title, lastMessage, status, unread, avatar });
            });
          } catch (error) {
            console.error('Chat son mesajı okunurken hata oldu', error.message);
          }

        }

      });
    });

  }