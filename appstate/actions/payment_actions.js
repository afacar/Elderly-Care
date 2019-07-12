import firebase from 'react-native-firebase';
import { Translations } from '../../constants/Translations';

export const do_payment = (cardData, price) => async (dispatch) => {
  const { _user } = firebase.auth().currentUser;
  const url = `users/${_user.uid}/payments`;
  // First update displayName, email, photoURL, phoneNumber to _user
  // Then update gender, birthdate etc. to profile
  console.log('In do_payment card recieved..', cardData);
  console.log('In do_payment price recieved..', parseFloat(price));
  try {
    let ref = await firebase.database().ref(url).push(cardData);
    console.log('card is added succesfully to !', ref.key);
    var makePayment = await firebase.functions().httpsCallable('makePayment');

    let data = {
      price: parseFloat(price),
      cardHolderName: cardData.name,
      cardNumber: cardData.number.replace(/ /g,''),
      expireMonth: cardData.expiry.split('/')[0],
      expireYear: '20'+cardData.expiry.split('/')[1],
      cvc: cardData.cvc,
      buyer: {
        id: 'BY789',
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
        contactName: 'Jane Doe',
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

    console.log('makePayment with...', data);

    makePayment(data).then((result) => {
      // Read result of the Cloud Function.
      var sanitizedMessage = result;
      console.log('makePayment result:', sanitizedMessage);
      console.log('do_payment is quiting...');
      // ...
    })
    .catch(err => console.log('makePayment err:\ ', err));
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    console.error(errorMessage);
  }

};