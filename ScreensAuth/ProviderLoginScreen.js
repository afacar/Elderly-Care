import React, { Component } from 'react';
import { View, Image, AsyncStorage, StyleSheet } from 'react-native';
import { Button, Text, Input, Card } from 'react-native-elements';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';

import * as actions from '../appstate/actions';
import { TextInput, CardItem, LoginIcon, CancelIcon, CheckIcon } from '../components/common/';
import { ScrollView } from 'react-native-gesture-handler';

const successImageUri = 'https://cdn.pixabay.com/photo/2015/06/09/16/12/icon-803718_1280.png';

const registerTitle = 'Yeni Kullanıcı';
const registerButton = 'Kayıt ol'
const signInTitle = 'Giriş yap'
const cancelTitle = 'İptal'
class ProviderLogin extends Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.state = {
      user: null,
      message: '',
      codeInput: '',
      phoneNumber: '',
      displayName: '',
      profession: '',
      experience: '',
      confirmResult: null,
      newUser: true,
      disabled: false
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

        if (this.state.newUser && this.state.confirmResult) {
          try {
            await this.props.createNewUserProfile(userRole, this.state.displayName, this.state.profession, this.state.experience);
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
          phoneNumber: '',
          confirmResult: null,
          displayName: "",
          profession: "",
          experience: ""
        });

      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.unsubscribe) this.unsubscribe();
    console.log(`ProviderLogin will unmount!`);
  }

  signIn = async () => {
    const { phoneNumber, displayName, profession, experience, } = this.state;
    if (phoneNumber.length < 10) {
      this.setState({ message: 'Geçerli bir numara giriniz...' });
    }
   else if (this.state.newUser && (displayName.length < 6 || !displayName))
      this.setState({ message: 'Geçerli bir isim giriniz...' });
    else if (this.state.newUser && (profession.length < 2 || !profession))
      this.setState({ message: 'Geçerli bir uzmanlık alanı giriniz...' });
    else if (this.state.newUser && (experience.length < 1 || !experience))
      this.setState({ message: 'Geçerli bir biografi giriniz...' });
    else {
      if (!this.state.newUser) {
        this.setState({ disabled: true })
        await firebase.database().ref(`phoneNumbers/${phoneNumber}`).once('value', snapshot => {
          this.setState({ disabled: false })
          if (!snapshot.exists()) {
            this.setState({ message: "Girdiğiniz numaraya kayıtlı kullanıcı bulunamadı" })
          } else {
            this.setState({ message: 'Kod SMS ile yollanıyor ...' });
            firebase.auth().signInWithPhoneNumber(phoneNumber)
              .then(confirmResult => {
                this._isMounted && this.setState({ confirmResult, message: 'Kod yollandı!' })
              })
              .catch(error => this.setState({ message: `Telefon numarası Hata mesajı: ${error.message}` }));
          }
        })
      } else {
        this.setState({ disabled: true })
        await firebase.database().ref(`phoneNumbers/${phoneNumber}`).once('value', snapshot => {
          this.setState({ disabled: false })
          if (snapshot.exists()) {
            this.setState({ message: "Kayıtlı numara girdiniz. Giriş yapmayı deneyin" })
          } else {
            this.setState({ message: 'Kod SMS ile yollanıyor ...' });
            firebase.auth().signInWithPhoneNumber(phoneNumber)
              .then(confirmResult => {
                this._isMounted && this.setState({ confirmResult, message: 'Kod yollandı!' })
              })
              .catch(error => this.setState({ message: `Telefon numarası Hata mesajı: ${error.message}` }));
          }
        })
      }
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

  changeUserState = (newUser) => {
    if (this._isMounted) {
      this.setState({
        newUser: newUser
      })
    }
  }

  renderButtons() {
    const { newUser } = this.state;

    return (
      <View style={{ flexDirection: 'row', width: '100%' }}>
        <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: newUser ? 3 : 0, borderBottomColor: 'blue', borderBottomStartRadius: 25 }}>
          <Button type='clear' title={registerTitle} onPress={() => this.changeUserState(true)} buttonStyle={{ margin: 10 }} disabled={this.state.disabled} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: newUser ? 0 : 3, borderBottomColor: 'blue', borderBottomRightRadius: 25 }}>
          <Button type='clear' title={signInTitle} onPress={() => this.changeUserState(false)} buttonStyle={{ margin: 10 }} disabled={this.state.disabled} />
        </View>
      </View>
    )
  }

  renderPhoneNumberInput() {
    const { phoneNumber, displayName, profession, experience, newUser } = this.state;
    if (newUser) {
      return (
        <Card style={{ padding: 25 }}>
          <ScrollView>
            <CardItem>
              <Input
                key='displayname'
                label='Ad Soyad'
                leftIcon={{
                  name: 'account',
                  type: 'material-community'
                }}
                placeholder='Ör. Ahmet Yılmaz'
                onChangeText={value => this.setState({ displayName: value })}
                value={displayName}
              />
            </CardItem>

            <CardItem>
              <Input
                label="Telefon numarası"
                keyboardType='phone-pad'
                leftIcon={{
                  name: 'phone',
                  type: 'material-community'
                }}
                style={{ height: 40, marginTop: 15, marginBottom: 15 }}
                onChangeText={value => this.setState({ phoneNumber: value })}
                placeholder={'+90 55... '}
                value={phoneNumber}
              />
            </CardItem>
            <CardItem>
              <Input
                key='profession'
                label='Uzmanlık alanı'
                leftIcon={{
                  name: 'work',
                  type: 'material-icons'
                }}
                placeholder='Ör. Nörolog'
                onChangeText={value => this.setState({ profession: value })}
                value={profession}
              />
            </CardItem>

            <CardItem>
              <Input
                key='experience'
                label='Biografi'
                leftIcon={{
                  name: 'timeline',
                  type: 'material-icons'
                }}
                placeholder='Ör. 7 yıllık tecrübe'
                onChangeText={value => this.setState({ experience: value })}
                value={experience}
              />
            </CardItem>

            <View style={styles.buttonStyle}>
              <Button title={registerButton} icon={<LoginIcon />} type='clear' color="green" onPress={this.signIn} disabled={this.state.disabled} />
            </View>
            <View style={styles.buttonStyle}>
              <Button title={cancelTitle} icon={<CancelIcon />} type='clear' color="red" onPress={() => this.props.navigation.goBack()} style={styles.buttonStyle} disabled={this.state.disabled} />
            </View>

          </ ScrollView>
        </Card>
      );
    } else {
      return (
        <Card style={{ padding: 25 }}>
          <CardItem>
            <Input
              label="Telefon numarası"
              leftIcon={{
                name: 'phone',
                type: 'material-community'
              }}
              keyboardType='phone-pad'
              style={{ height: 40, marginTop: 15, marginBottom: 15 }}
              onChangeText={value => this.setState({ phoneNumber: value })}
              placeholder={'+90 55... '}
              value={phoneNumber}
            />
          </CardItem>

          <View style={styles.buttonStyle}>
            <Button title={signInTitle} type='clear' icon={<LoginIcon />} color="green" onPress={this.signIn} disabled={this.state.disabled} />
          </View>
          <View style={styles.buttonStyle}>
            <Button title="İptal" type='clear' icon={<CancelIcon />} color="red" onPress={() => this.props.navigation.goBack()} style={styles.buttonStyle} />

          </View>
        </Card>
      );
    }
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
          style={{ height: 40, marginTop: 15, marginBottom: 15 }}
          onChangeText={value => this._isMounted && this.setState({ codeInput: value })}
          placeholder={'Kod ... '}
          value={codeInput}
        />
        <View style={styles.buttonStyle}>
          <Button title="Doğrula" icon={<CheckIcon />} type='clear' color="#841584" onPress={this.confirmCode} />
        </View>
      </View>
    );
  }

  render() {
    const { user, confirmResult } = this.state;
    return (
      <View style={{ flex: 1 }}>

        {!user && !confirmResult && this.renderButtons()}

        {!user && !confirmResult && this.renderPhoneNumberInput()}

        {this.renderMessage()}

        {!user && confirmResult && this.renderVerificationCodeInput()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonStyle: {
    margin: 10,
    marginHorizontal: '20%',
  }
});

export default connect(null, actions)(ProviderLogin);