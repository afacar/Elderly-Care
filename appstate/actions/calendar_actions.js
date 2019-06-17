import {
  ATTEMPT,
  FAIL,
  SUCCESS,
  REMINDER_FETCH
} from './types';
import firebase from 'react-native-firebase';

import { Translations } from '../../constants/Translations';
import { REMINDER_TYPES, REMINDER_TYPES_PLACEHOLDERS, REPEAT_TYPES } from '../../constants/Options';

export const fetch_calendar = (callback) => async (dispatch) => {
  const user = getUser();
  //dispatch({ type: ATTEMPT });
  try {
    // Fetch new reminders
    await firebase.database().ref(`reminders/${user.uid}/`).orderByChild('selectedDate').on('child_added', (snapshot) => {
      if (snapshot.val()) {
        const reminder = snapshot.val();
        const key = snapshot.key;
        callback({ ...reminder, key }, "child_added");
        //return dispatch({ type: REMINDER_FETCH, payload: result });
      }
    });

    // Fetch updated reminders
    await firebase.database().ref(`reminders/${user.uid}/`).orderByChild('selectedDate').on('child_changed', (snapshot) => {
      if (snapshot.val()) {
        const reminder = snapshot.val();
        const key = snapshot.key;
        callback({ ...reminder, key }, "child_changed");
      }
    });

    // Fetch after deleted reminders
    await firebase.database().ref(`reminders/${user.uid}/`).orderByChild('selectedDate').on('child_removed', (snapshot) => {
      if (snapshot.val()) {
        const reminder = snapshot.val();
        const key = snapshot.key;
        callback({ ...reminder, key }, "child_removed");
      }
    });

    // Fetch new measurements
    await firebase.database().ref(`measurements/${user.uid}/`).orderByChild('selectedDate').on('child_added', (snapshot) => {
      if (snapshot.val()) {
        const measurement = snapshot.val();
        const key = snapshot.key;
        callback({ ...measurement, key }, "child_added");
      }
    });

    // Fetch updated measurements
    await firebase.database().ref(`measurements/${user.uid}/`).orderByChild('selectedDate').on('child_changed', (snapshot) => {
      if (snapshot.val()) {
        const measurement = snapshot.val();
        const key = snapshot.key;
        callback({ ...measurement, key }, "child_changed");
      }
    });

    // Fetch after deleted measurements
    await firebase.database().ref(`measurements/${user.uid}/`).orderByChild('selectedDate').on('child_removed', (snapshot) => {
      if (snapshot.val()) {
        const measurement = snapshot.val();
        const key = snapshot.key;
        callback({ ...measurement, key }, "child_removed");
      }
    });

  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error("fet_calendar yaparken hata->", errorMessage);
  }
};

export const fetch_measurements = (callback, measurementName='', userid = '', date = new Date()) => async (dispatch) => {
  /**
   * Check if the measurements that will be fetched belongs to current user or specific user
   */
  let uid = userid;

  if (!uid) uid = getUser().uid;

  /**
   * Date interval is current month if not stated otherwise
   */
  const year = date.getFullYear();
  const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
  const startDate = year + '-' + month + '-01';
  const endDate = year + '-' + month + '-31';

  let measurementURL = `measurements/${uid}`;

  try {
    // Fetch updated measurements .orderByChild("date")
    console.log('measurementURL = ', measurementURL);
    await firebase.database().ref(measurementURL).orderByChild('measurementName')
      .equalTo(measurementName).on('value', async (snapshot) => {
        //dispatch({ type: SUCCESS });
        console.log("fetch_measurements snapshot=> ", snapshot.val());
        console.log("fetch_measurements measurementName=> ", measurementName);
        if (snapshot.val()) {
          const measurements = snapshot.val();
          //const key = snapshot.key;
          console.log('fetch_measurements snapshot val is', measurements);
          callback(measurements);
          //return dispatch({ type: REMINDER_FETCH, payload: result });
        }
      });
  } catch (error) {
    throw new Error(error.message);
  }

}

export const save_reminder = (reminder) => async (dispatch) => {
  // Check key of object to see if it is update or new
  console.log("save_reminder", reminder);
  const { key, reminderType, reminderName, title, selectedDate, selectedTime, repeat } = reminder;

  const user = firebase.auth().currentUser;
  if (key) {
    // This is an update for the current reminder
    try {
      // We need the ${key} of this record in firebase
      await firebase.database().ref(`reminders/${user.uid}/${key}`)
        .update({ reminderType, title, selectedDate, selectedTime, repeat });
      this.setLocalNotification(reminder);
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      throw new Error(errorMessage);
    }
  } else {
    // This is a new reminder
    try {
      // Adding new reminder
      let myRef = await firebase.database().ref(`reminders/${user.uid}/`).push();
      const key = myRef.key;
      await myRef.set({ reminderType, reminderName, title, selectedDate, selectedTime, repeat });
      //let key = await firebase.database().ref(`users/${user.uid}/Reminders/${reminder.selectedDate}`).push({ name, level, firstDiagnosisDate, notes });
      if (repeat !== 0) await this.setLocalNotification({ ...reminder, key });
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      throw new Error(errorMessage);
    }
  }

};

export const delete_reminder = (reminder) => async (dispatch) => {
  const { key, repeat } = reminder;
  if (!key) {
    throw new Error("Key bulunamadığı için hatırlatma silinemedi!");
  }
  const user = firebase.auth().currentUser;
  try {
    await firebase.database().ref(`reminders/${user.uid}/${key}`).remove();
    if (repeat !== 0) await this.cancelLocalNotification(key);
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
  }
};

setLocalNotification = async (reminder) => {
  const { key, reminderType, title, selectedDate, selectedTime, repeat } = reminder;
  // Build notification
  const notification = new firebase.notifications.Notification()
    .setNotificationId(key + 'notificationId')
    .setTitle(title)
    .setBody(REMINDER_TYPES[reminderType])
    .setData({
      key1: 'value1',
      key2: 'value2',
    });

  notification
    .android.setChannelId('test-channel')
    .android.setSmallIcon('ic_launcher');

  // Schedule the notification for 1 minute in the future
  const dateString = selectedDate + 'T' + selectedTime;
  const notificationTime = new Date(dateString).getTime();
  const currentTime = new Date().getTime();
  const timeDifference = notificationTime - currentTime;
  //date.setSeconds(date.getSeconds() + 15);
  const repeatIntervals = ['', 'once', 'minute', 'hour', 'day', 'week'];
  const repeatInterval = repeatIntervals[repeat];
  console.log("repeatInterval=", repeatInterval);
  if (timeDifference > 0 && repeatInterval == 'once') {
    firebase.notifications().scheduleNotification(notification, {
      fireDate: notificationTime,
    })
      .then(() => console.log("localNotification is scheduled!"))
      .catch(error => console.log("Error occured before localNotification is scheduled", error.message));
  } else {
    firebase.notifications().scheduleNotification(notification, {
      fireDate: notificationTime,
      repeatInterval, // One of minute, hour, day or week.
    })
      .then(() => console.log("localNotification is scheduled!"))
      .catch(error => console.log("Error occured before localNotification is scheduled", error.message));
  }
}

cancelLocalNotification = async (key) => {
  const notificationId = key + 'notificationId';
  // NOTE: There is firebase.notifications().removeDeliveredNotification!
  firebase.notifications().cancelNotification(notificationId)
    .then((res) => console.log(notificationId, " IDli bildirim iptal edildi!"))
    .catch(error => console.log(notificationId, " IDli bildirim  iptal edilirken hata oldu:!", error.message));
}

export const save_measurement = (measurement) => async (dispatch) => {
  const { key } = measurement;
  const user = firebase.auth().currentUser;

  if (key) {
    // Update existing measurement
    try {
      await firebase.database().ref(`measurements/${user.uid}/${key}`).update(measurement);
      //dispatch({ type: SUCCESS, payload: `${measurementlabel} ölçümü güncellendi!` });
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      throw new Error(errorMessage);
      //return dispatch({ type: FAIL, payload: errorMessage });
    }
  } else {
    // Create new measurement
    try {
      let myRef = await firebase.database().ref(`measurements/${user.uid}/`).push();
      const key = myRef.key;
      //const newMeasurement = { ...measurement, key };
      await myRef.set(measurement);
      //let key = await firebase.database().ref(`users/${user.uid}/Reminders/${reminder.selectedDate}`).push({ name, level, firstDiagnosisDate, notes });
      //dispatch({ type: SUCCESS, payload: `${measurementlabel} ölçümü kaydedildi!` });
    } catch (error) {
      const errorMessage = Translations[error.code] || error.message;
      throw new Error(errorMessage);
      //return dispatch({ type: FAIL, payload: errorMessage });
    }
  }
};

export const delete_measurement = (measurement) => async (dispatch) => {
  const { key, measurementName } = measurement;

  if (!key) {
    throw new Error("Key bulunamadığı için Ölçüm silinemedi!");
    //return dispatch({ type: FAIL, payload: "Key bulunamadığı için Ölçüm silinemedi!" });
  }
  const user = firebase.auth().currentUser;
  //dispatch({ type: ATTEMPT });
  try {
    await firebase.database().ref(`measurements/${user.uid}/${key}`).remove();
    //dispatch({ type: SUCCESS, payload: `${measurementlabel} ölçümü başarıyla silindi!` });
  } catch (error) {
    const errorMessage = Translations[error.code] || error.message;
    throw new Error(errorMessage);
    //return dispatch({ type: FAIL, payload: errorMessage });
  }
};

function getUser() {
  return firebase.auth().currentUser;
}