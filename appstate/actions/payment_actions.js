import firebase from 'react-native-firebase';
import { Translations } from '../../constants/Translations';
import { getFormattedDateTime } from '../../components/functions';

export const start_payment = (cardData, conversationId, price) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  console.log('_user', _user);
  let { displayName, email, phoneNumber, metadata } = _user;
  const { creationTime, lastSignInTime } = metadata;
  const lastLoginDate = getFormattedDateTime(lastSignInTime);
  const registrationDate = getFormattedDateTime(creationTime);

  console.log('lastLoginDate', lastLoginDate);
  console.log('registrationDate', registrationDate);

  const tempName = displayName.split(' ');
  let name = tempName[0];
  let surname = tempName[1];
  const nameLength = tempName.length;
  
  if (nameLength === 3) {
    name = tempName[0] + ' ' + tempName[1];
    surname = tempName[nameLength-1];
  } else if (nameLength === 1) {
    name = tempName[0];
    surname = tempName[0];
  }

  email = email || 'info@afacar.com';
  const gsmNumber = phoneNumber || '+905554443322';
  //const url = `users/${_user.uid}/payments`;

  let data = {
    price: parseFloat(price),
    cardHolderName: cardData.name,
    cardNumber: cardData.number.replace(/ /g, ''),
    expireMonth: cardData.expiry.split('/')[0],
    expireYear: '20' + cardData.expiry.split('/')[1],
    cvc: cardData.cvc,
    conversationId: conversationId,
    conversationData: _user.displayName + "-" + conversationId,
    buyer: {
      id: _user.uid,
      name,
      surname,
      gsmNumber,
      email,
      identityNumber: '74300864791',
      lastLoginDate,
      registrationDate,
      registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
      ip: '85.34.78.112',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34732'
    },
    buyerAddress: {
      contactName: cardData.name,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
      zipCode: '34742'
    },
    items: [
      {
        id: 'BI101',
        name: 'Evde Bakim Uygulamasi Kredisi',
        category1: 'Collectibles',
        //category2: 'Accessories',
        itemType: `Iyzipay.BASKET_ITEM_TYPE.VIRTUAL`,
        price: parseFloat(price)
      }
    ]
  };

  console.log('data is ready for callable makePayment method');
  var makePayment = firebase.functions().httpsCallable('makePayment');

  return new Promise((resolve, reject) => {
    makePayment(data)
      .then((result) => {
        console.log('makePayment resolves =>', result);
        resolve(result);
      })
      .catch(err => {
        console.log('makePayment rejects =>', err);
        reject(err);
      });
  });
};

export const finalize_payment = ((paymentObject) => async (dispatch) => {
  var finalizePayment = firebase.functions().httpsCallable('finalizePayment');
  return new Promise((resolve, reject) => {
    finalizePayment(paymentObject)
      .then((result) => {
        console.log("RESULT", result)
        resolve(result)
      })
      .catch(err => {
        console.log('finalizepayment rejects =>', err);
        reject(err);
      });
  });
});

export const checkNewPayment = (callback) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;
  console.log("Inside new payments", uid);
  await firebase.database().ref('payments/results').child(uid).on("child_added", newPayment => {
    console.log("New payment", newPayment.val());
    callback(newPayment.val())
  })
}