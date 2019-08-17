import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  View,
  Alert,
  AsyncStorage,
  Image,
  Text,
} from 'react-native';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';

import * as actions from '../appstate/actions';

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
};

class SplashScreen extends React.Component {
  //_user = null;

  render() {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/images/akilli_ajanda_logo.png')}
          style={{ width: '100%', height: '20%', resizeMode: 'contain' }}
        />
        <Text
          style={{
            fontSize: 32,
            fontStyle: 'italic',
            color: 'black',
            textAlign: 'center',
            fontWeight: 'bold',
            fontFamily: 'Impact'
          }}>
          Evde Bakım Desteği
        </Text>
      </View>
    );
  }

  async componentDidMount() {
    console.log("SplashScreen didMount...");
    const isNewUser = this.props.navigation.getParam('isNewUser', '');
    const role = this.props.navigation.getParam('role', '');

    //await this.performTimeConsumingTask();

    if (firebase.auth().currentUser) {
      // this._user = firebase.auth().currentUser._user;
      await this._routeUser(isNewUser, role);
    } else {
      this.props.navigation.navigate('Auth');
    }
  }


  performTimeConsumingTask = async () => {
    return new Promise((resolve) =>
      setTimeout(
        () => { resolve('result') },
        2000
      )
    );
  }

  /** 
   *  1. Checks the role of user
   *  2. Checks Notification permissions
   *  3. Create Notification listeners
   *  4. Routes user based on role and isNewUSer
   */
  _routeUser = async (isNewUser, role) => {
    // Check Permissions, getToken that is InstanceId for FCM

    const { _user } = firebase.auth().currentUser;
    let userRole = role;
    console.log('_user', _user);

    if (!userRole) {
      console.log('calling getUserRole()...');
      try {
        await this.props.getUserRole((role) => {
          userRole = role;
        });
      } catch (error) {
        console.error('HATA: this.props.getUserRole()', error.message);
      }
    }

    console.log('after getUserRole() userRole is', userRole);

    if (!userRole) {
      try {
        console.log('userRole hiç biyerde bulunamadı, çıkış yapılıyor...');
        await this.props.logout();
        console.log('Çıkış yapıldı ve ... -> AuthScreen gidiliyor');
      } catch (error) {
        console.log('User doesnt have role and also cannot log out with error:', error.message);
      }
      return this.props.navigation.navigate('Auth');
    }

    // Check Notification permissions 
    try {
      await this.checkPermission();
      console.log('Notification permissions checked!');
    } catch (error) {
      console.log('checkPermission hata! logging out...', error.message);
      await this.props.logout();
      this.props.navigation.navigate('Auth');
    }

    // Create Notification listeners
    try {
      await this.createNotificationListeners(); //add this line
      console.log('createNotificationListeners complete!');
    } catch (error) {
      console.log('createNotificationListeners hata! Loggin out...:', error.message);
      await this.props.logout();
      return this.props.navigation.navigate('Auth');
    }


    console.log('before navigating, userRole is ', userRole);
    // Route user according to role 
    // NOTE: Add more route based on isNewUser
    if (userRole === 'p') {
      console.log('user is navigating to -> ProviderHome');
      this.props.navigation.navigate('Provider');
    } else if (userRole === 'c') {
      console.log('user is navigating to -> CaregiverHome');
      this.props.navigation.navigate('Caregiver');
    } else {
      console.log('onknown user Role:', userRole);
      try {
        await this.props.logout();
      } catch (error) {
        console.error('HATA: Bilinmeyen role ile gelen kullanıcı çıkıı yapılamadı!', error.message);
      }
      this.props.navigation.navigate('Auth');
    }

  }

  //Remove listeners allocated in createNotificationListeners()
  componentWillUnmount() {
    console.log("SplashScreen is unmounting!");
    //if (this.unsubscribe) this.unsubscribe();
  }

  async createNotificationListeners() {

    // Build a channel
    const channel = new firebase.notifications.Android.Channel('homecare-channel', 'Homecare Notification Channel', firebase.notifications.Android.Importance.Max)
      .setDescription('My app (Homecare) test channel');

    // Create the channel
    firebase.notifications().android.createChannel(channel);

    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      console.log("onNotification received in foreground ", notification);
      //this.showAlert(title, body);
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      console.log(`Title:${title}, body:${body}`);
      console.log("onNotificationOpened received in background ", notificationOpen);
      //this.showAlert(title, body);
    });

    /* 
    * Triggered when a particular notification has been displayed. 
    * iOS Only: see IOSNotification#complete for details on handling completion of background downloads 
    **/
    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notificationDisplayed) => {
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
      const action = notificationDisplayed.action;
      const notification = notificationDisplayed.notification;
      console.log("onNotificationDisplayed when a particular notification has been displayed: ", notificationDisplayed);
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      // { title, body } burada gelmiyor! Bunun için data objesi içinde ayrıca göndermek gerek.
      console.log("getInitialNotification when app is closed: ", notificationOpen);
    }

    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });

    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(token => {
      // Process your token as required
      console.log("onTokenRefresh :", token);
      this._saveToken(token);
    });

  }

  showAlert(title, body) {
    Alert.alert(
      title, body,
      [
        { text: 'Tamam', onPress: () => { } },
      ],
      { cancelable: false },
    );
  }

  //1
  checkPermission = async () => {
    try {
      let enabled = await firebase.messaging().hasPermission();
      if (enabled) {
        console.log("Push permission var, token al!");
        this.getToken();
      } else {
        this.requestPermission();
      }
    } catch (error) {
      console.log('checkPermisson error:', error.message);
    }

  }

  //3
  getToken = async () => {
    try {
      let token = await AsyncStorage.getItem('FCMToken');
      console.log("Existing token is,", token);
      if (!token) {
        token = await firebase.messaging().getToken();
        console.log("New Token is taken :", token);
        await this._saveToken(token);
      }
    } catch (error) {
      console.log('getToken error:', error.message);
    }

  }

  //2
  requestPermission = async () => {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  //4
  _saveToken = async (token) => {
    const { _user } = firebase.auth().currentUser;
    const url = `users/${_user.uid}/FCMToken`;

    if (token) {
      // user has a device token
      console.log('_saveToken url', url);
      console.log('_saveToken token', token);
      try {
        await AsyncStorage.setItem('FCMToken', token);
        console.log("_saveToken FCMToken is saved to locale!");
        await firebase.database().ref(url).set(token);
        console.log("_saveToken FCMToken is saved to firebase!");
      } catch (error) {
        console.log("_saveToken has error", error.message);
      }
    }
  }

}

function mapStateToProps({ auth }) {
  return { user: auth.user };
}

export default connect(mapStateToProps, actions)(SplashScreen);