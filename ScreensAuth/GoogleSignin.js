import React, { Component } from 'react';
import { View, AsyncStorage } from 'react-native';
import { GoogleSigninButton } from 'react-native-google-signin';
import { connect } from 'react-redux';

import * as actions from '../appstate/actions';
import firebase from 'react-native-firebase';

class GoogleSignin extends Component {
  state = { isSigninInProgress: false };

  _onPress = async () => {
    // this.props.handleLogin({ loading: true });
    /** If there is no userRole parameter from parent,
     *  Google Login will be caregiver Login
     */
    const userRole = this.props.userRole || 'c';

    try {
      await this.props.loginWithGoogle();
    } catch (error) {
      console.log("Google Login Hatası Detayı", error.message);
     // this.props.handleLogin({ loading: false, errorMessage: `Google Login Hatası: ${error.message}` });
    }

    if(!firebase.auth().currentUser) return;
    
    const { _user } = firebase.auth().currentUser;

    if (!_user.uid) throw new Error('HATA: Google NOT logged in!');

    const { lastSignInTime, creationTime } = _user.metadata;

    const membershipTime = lastSignInTime - creationTime;
    console.log('how old is membershipTime?', membershipTime);

    // If membershipTime is less then 500 ms., it is new user!
    let isNewUser = (lastSignInTime - creationTime) < 500;
    console.log('isNewUser:', membershipTime);

    this.props.navigate('SplashScreen', { isNewUser, role: userRole });

    try {
      console.log('Setting caregiver role to Google user...', userRole);
      // set users Role 
      await this.props.setUserRole(userRole);
      console.log(`!Role is set to caregiver for Google user`);
    } catch (error) {
      console.error(`HATA: Yeni google user role set ederken hata:`, error.message);
    }

    if (isNewUser) {
      try {
        // Yeni Google kullanıcısına profil yaratılıyor...
        console.log('Creating profile for New Google User...');
        await this.props.createNewUserProfile(userRole);
      } catch (error) {
        console.log('Yeni Google kullanıcısına yeni profil oluştururken hata :', error.message);
      }
    }
    
  }

  render() {
    return (
      <View>
        <GoogleSigninButton
          style={{ width: 200, height: 45 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          onPress={this._onPress}
          disabled={this.props.disabled} />
      </View>
    );
  }

  componentDidMount() { }

};

const GoogleLoginButton = connect(null, actions)(GoogleSignin);

export default GoogleLoginButton;