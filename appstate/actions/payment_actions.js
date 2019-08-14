import firebase from 'react-native-firebase';
import { Translations } from '../../constants/Translations';

export const start_payment = (cardData, conversationId, price) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  const url = `users/${_user.uid}/payments`;

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
      name: 'John',
      surname: 'Doe',
      gsmNumber: '+905350000000',
      email: 'email@email.com',
      identityNumber: '74300864791',
      lastLoginDate: '2015-10-05 12:43:35',
      registrationDate: '2013-04-21 15:12:09',
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
        name: 'Binocular',
        category1: 'Collectibles',
        category2: 'Accessories',
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

export const finalize_payment = ((paymentObject) => async(dispatch) => {
  var finalizePayment = firebase.functions().httpsCallable('finalizePayment');
  let result = await finalizePayment(paymentObject);
  console.log("RESULT", result)
  return result;
});

export const checkNewPayment = (callback) => async (dispatch) => {
  const uid = firebase.auth().currentUser.uid;
  console.log("Inside new payments", uid);
  await firebase.database().ref('payments/results').child(uid).on("child_added", newPayment => {
    console.log("New payment", newPayment.val());
    callback(newPayment.val())
  })
}