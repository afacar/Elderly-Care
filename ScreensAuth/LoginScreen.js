import React, { Component } from 'react';
import { ScrollView, Text, NetInfo, ActivityIndicator, Image, View } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import Toast, { DURATION } from 'react-native-easy-toast';
import { SafeAreaView } from 'react-navigation';

import * as actions from '../appstate/actions';
import FacebookLoginButton from './FacebookLogin';
import GoogleLoginButton from "./GoogleSignin";
import { CardItem } from '../components/common';

class LoginScreen extends Component {
  state = {
    isModalVisible: false,
    errorMessage: '',
    successMessage: '',
    loading: false,
    isConnected: true,
  };

  _mounted = false;

  static navigationOptions = { header: null };

  /*   static navigationOptions = {
      title: '',
    }; */

  handleModal = (isModalVisible) => {
    if (this._mounted) this.setState({ isModalVisible });
  }

  handleLogin = ({ loading = false, errorMessage = '', successMessage = '' }) => {
    const loadingIcon = <ActivityIndicator />;
    if (this._mounted) this.setState({ loading, errorMessage, successMessage });
    if (this._mounted && loading) {
      console.log("Opening Toast");
      // this.refs.toast.show(loadingIcon, DURATION.FOREVER);
    } else if (this._mounted) {
      console.log("Closing Toast");
      // this.refs.toast.close(loadingIcon, 0);
    }
  }

  render() {
    if (!this.state.isConnected) {
      return (
        <Card style={styles.loginContainer} >
          <Text style={styles.labelStyle}>{this.state.errorMessage}</Text>
        </Card>
      );
    }
    const { navigate } = this.props.navigation;
    return (
      <ScrollView style={{ backgroundColor: 'white' }}>
        <SafeAreaView>
        <CardItem style={[styles.cardItemStyle, { marginTop: 15 }]}>
          <Image
            style={styles.stretch}
            source={require('../assets/images/akilli_ajanda_logo.png')}
          />
        </CardItem>
        </SafeAreaView>
        <Card title="Bakıcı Girişi" titleStyle={{ fontSize: 23 }} style={styles.loginContainer}>
          <Toast ref="toast" position='top' />
          <Text style={styles.labelStyle}>{this.state.errorMessage}</Text>
          <CardItem style={styles.cardItemStyle}>
            <Image
              style={{ width: 70, height: 70 }}
              source={require('../assets/images/family2.png')}
            />
          </CardItem>
          <CardItem style={styles.cardItemStyle}>
            <FacebookLoginButton
              disabled={!this.state.isConnected}
              handleLogin={this.handleLogin}
              navigate={navigate}
            />
          </CardItem>
          <CardItem style={styles.cardItemStyle}>
            <GoogleLoginButton
              //style={{ width: 192, height: 48 }}
              disabled={!this.state.isConnected}
              handleLogin={this.handleLogin}
              navigate={navigate}
            />
          </CardItem>
        </Card>

        <Card title="Uzman Girişi" titleStyle={{ fontSize: 23 }} containerStyle={{ marginBottom: 15 }}>
          <CardItem style={styles.cardItemStyle}>
            <Image
              style={{ width: 70, height: 70 }}
              source={require('../assets/images/doctor2.png')}
            />
          </CardItem>
          <CardItem style={styles.cardItemStyle}>
            <Button
              icon={{
                type: 'material-community',
                name: 'cellphone-message',
                size: 21,
                color: 'white'
              }}
              disabled={!this.state.isConnected}
              buttonStyle={{width:192, height:40, backgroundColor:'#074684'}}
              name='phone' title='Sms ile Giriş'
              onPress={() => navigate('ProviderLoginScreen')} />
          </CardItem>
        </Card>
      </ScrollView>
    );
  }

  componentDidMount() {
    this._mounted = true;
    NetInfo.isConnected.addEventListener('connectionChange', this._checkConnection);
    this._checkInitialConnection();
  }

  _checkInitialConnection = async () => {
    let isConnected = await NetInfo.isConnected.fetch();
    if (!isConnected) this._checkConnection(isConnected);
  }

  _checkConnection = async (isConnected) => {
    this.setState({ isConnected });
    if (!isConnected) {
      this.setState({ errorMessage: "İnternet bağlantısı yok!" });
    } else {
      this.setState({ errorMessage: '' });
    }
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this._checkConnection);
    this._mounted = false;
  }
}

const styles = {
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    flex: 1,
    backgroundColor: "rgba(92, 99,216, 1)",
    borderRadius: 5,
    borderWidth: 0,
    paddingTop: 30,
  },
  cardItemStyle: {
    alignItems: 'center',
  },
  labelStyle: {
    color: 'red',
    fontSize: 18,
    justifyContent: 'center',
  },
  stretch: {
    paddingTop: 30,
    width: 200,
    height: 50,
  }
};

/* function mapStateToProps({ auth, common }) {
  return { user: auth.user, common };
} */

export default connect(null, actions)(LoginScreen);