import React, { Component } from 'react';
import { View, Image, AsyncStorage } from 'react-native';
import { Button, Text, Input } from 'react-native-elements';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';

import * as actions from '../appstate/actions';

const successImageUri = 'https://cdn.pixabay.com/photo/2015/06/09/16/12/icon-803718_1280.png';

class ProviderLogin extends Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.state = {
      user: null,
      message: '',
      codeInput: '',
      phoneNumber: '+90 5542421417',
      confirmResult: null,
    };
  }

  _isMounted = false;

  static navigationOptions = {
    title: 'Uzman giriş ekranı',
  };

  async componentDidMount() {
    this._isMounted = true;
    console.log(`ProviderLogin is mounted`);
    this.unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log('uzman user is:', user);
        //this.setState({ user: user.toJSON() });

        // User role is Provider by default unless parent sent userRole parameter
        const userRole = this.props.userRole || 'p';
        const { _user } = user;
        const { lastSignInTime, creationTime } = _user.metadata;

        let isNewUser = (lastSignInTime - creationTime) < 500;
        console.log('isNewUser:', lastSignInTime - creationTime);

        try {
          // set users Role 
          await this.props.setUserRole(userRole);
          console.log(`!setUserRole() is successful for Provider`, userRole);
        } catch (error) {
          console.error(`setUserRole() has error:`, error.message);
        }

        if (isNewUser) {
          try {
            await this.props.createNewUserProfile(userRole);
            console.log(`!createNewUserProfile() is successful for new user:`);
          } catch (error) {
            console.error(`createNewUserProfile() gives error:`, error.message);
          }
        }

        this.props.navigation.navigate('SplashScreen', { isNewUser, role: userRole });
      } else {
        // User has been signed out, reset the state
        this.setState({
          user: null,
          message: '',
          codeInput: '',
          phoneNumber: '+90 5542421417',
          confirmResult: null,
        });
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.unsubscribe) this.unsubscribe();
    console.log(`ProviderLogin will unmount!`);
  }

  signIn = () => {
    const { phoneNumber } = this.state;
    if (phoneNumber.length < 10) {
      this.setState({ message: 'Geçerli bir numara giriniz...' });
    }
    else {
      this.setState({ message: 'Kod SMS ile yollanıyor ...' });
      firebase.auth().signInWithPhoneNumber(phoneNumber)
        .then(confirmResult => {
          this._isMounted && this.setState({ confirmResult, message: 'Kod yollandı!' })
        })
        .catch(error => this.setState({ message: `Telefon numarası Hata mesajı: ${error.message}` }));
    }
  };

  confirmCode = async () => {
    const { codeInput, confirmResult } = this.state;

    if (confirmResult && codeInput.length) {
      console.log(`confirmResult: ${confirmResult} && codeInput: ${codeInput}`);
      confirmResult.confirm(codeInput)
        .then(async (user) => {
          this._isMounted && this.setState({ message: 'Kod doğrulandı!' });
        })
        .catch(error => this.setState({ message: `Hatalı kod mesajı: ${error.message}` }));
    }
  };

  signOut = () => {
    firebase.auth().signOut();
  }

  renderPhoneNumberInput() {
    const { phoneNumber } = this.state;

    return (
      <View style={{ padding: 25 }}>
        <Input
          label="Telefon numarası"
          autoFocus
          keyboardType='phone-pad'
          style={{ height: 40, marginTop: 15, marginBottom: 15 }}
          onChangeText={value => this.setState({ phoneNumber: value })}
          placeholder={'55... '}
          value={phoneNumber}
        />
        <Button title="Giriş yap" color="green" onPress={this.signIn} />
        <Button title="İptal" color="red" onPress={() => this.props.navigation.goBack()} />
      </View>
    );
  }

  renderMessage() {
    const { message } = this.state;

    if (!message.length) return null;

    return (
      <Text style={{ padding: 5, backgroundColor: '#000', color: '#fff' }}>{message}</Text>
    );
  }

  renderVerificationCodeInput() {
    const { codeInput } = this.state;

    return (
      <View style={{ marginTop: 25, padding: 25 }}>
        <Text>Doğrulama kodunu aşağıya giriniz!</Text>
        <Input
          autoFocus
          keyboardType='phone-pad'
          style={{height: 40, marginTop: 15, marginBottom: 15 }}
          onChangeText={value => this._isMounted && this.setState({ codeInput: value })}
          placeholder={'Kod ... '}
          value={codeInput}
        />
        <Button title="Doğrula" color="#841584" onPress={this.confirmCode} />
      </View>
    );
  }

  render() {
    const { user, confirmResult } = this.state;
    return (
      <View style={{ flex: 1 }}>

        {!user && !confirmResult && this.renderPhoneNumberInput()}

        {this.renderMessage()}

        {!user && confirmResult && this.renderVerificationCodeInput()}
      </View>
    );
  }
}

export default connect(null, actions)(ProviderLogin);