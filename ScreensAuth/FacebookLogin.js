import React, { Component } from 'react';
import { View, AsyncStorage } from 'react-native';
import { LoginButton, AccessToken } from 'react-native-fbsdk';
import { connect } from 'react-redux';
import firebase from 'react-native-firebase';

import * as actions from '../appstate/actions';

class FacebookLogin extends Component {

  render() {
    return (
      <View>
        <LoginButton
          onLoginFinished={
            (error, result) => {
              if (error) {
                console.log(error);
                // this.props.handleLogin({ errorMessage: error.message });
              } else if (result.isCancelled) {
                // this.props.handleLogin({ errorMessage: "Giriş iptal edildi!" });
              } else {
                AccessToken.getCurrentAccessToken().then(
                  async (data) => {
                  console.log("Başarılı")
                    /** 
                     *  If there is no userRole parameter from parent,
                     *  FB Login will be caregiver Login by default!
                     */
                    const userRole = this.props.userRole || 'c';

                    try {
                      await this.props.loginWithFacebook(data);
                      console.log("!Facebook Login Successful");
                    } catch (error) {
                      console.error("Facebook Login Hatası Detayı:", error);
                      // this.props.handleLogin({ errorMessage: "Facebook Login Hatası!" });
                    }

                    const { _user } = firebase.auth().currentUser;
                    console.log('_user', _user);

                    if (!_user.uid) throw new Error('Google NOT logged in somehow!');

                    const { lastSignInTime, creationTime } = _user.metadata;

                    const membershipTime = lastSignInTime - creationTime;
                    console.log('how old is membershipTime?', membershipTime);

                    // If membershipTime is less then 500 ms., it is new user!
                    let isNewUser = (lastSignInTime - creationTime) < 500;
                    console.log('isNewUser:', membershipTime);

                    try {
                      // set users Role 
                      await this.props.setUserRole(userRole);
                      console.log(`!setUserRole() is successful for new FB user:`, userRole);
                    } catch (error) {
                      console.error(`yeni FB kullanıcıyı set to c ederken hata:`, error.message);
                    }

                    if (isNewUser) {
                      try {
                        // Yeni FB kullanıcısına profil yaratılıyor...
                        await this.props.createNewUserProfile(userRole);
                        console.log(`!createNewUserProfile() is successful for new FB user:`);
                      } catch (error) {
                        console.error('Yeni FB kullanıcısına yeni profil oluştururken hata :', error.message);
                      }
                    }

                    console.log("And now navigating from FacebookLogin to SplashScreen");
                    this.props.navigate('SplashScreen', { isNewUser, role: userRole });
                  }
                ).catch(
                  error => console.log(error.message)
                )
              }
            }
          }
          onLogoutFinished={() => console.log("FB logout.")} />
      </View>
    );
  }

  componentDidMount() { }

};

const FacebookLoginButton = connect(null, actions)(FacebookLogin);

export default FacebookLoginButton;