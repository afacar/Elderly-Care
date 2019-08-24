import React, { Component } from 'react';
import { ScrollView, Text, NetInfo, ActivityIndicator, Image, View, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { connect } from 'react-redux';
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
  }

  render() {
    if (!this.state.isConnected) {
      return (
        <View style={styles.container}>
          <Text style={styles.labelStyle}>{this.state.errorMessage}</Text>
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
              //fontFamily: 'Impact'
            }}>
            Evde Bakım Desteği
        </Text>
        </View>
      );
    }
    const { navigate } = this.props.navigation;
    return (
      <ScrollView style={{ flex: 1, }} contentContainerStyle={{alignItems:'center',alignContent: 'center', flexGrow: 1,justifyContent: 'center'}}> 
        <View style={{ alignSelf:'center', alignItems: "center", backgroundColor: 'white', justifyContent: 'center' }}>
          <SafeAreaView>
            <CardItem style={[styles.cardItemStyle, { marginTop: 15 }]}>
              <Image
                style={styles.stretch}
                source={require('../assets/images/akilli_ajanda_logo.png')}
              />
            </CardItem>
          </SafeAreaView>
          <Card title="Evde Bakım Uygulaması" titleStyle={{ fontSize: 23 }} style={styles.loginContainer}>
            <Text style={styles.labelStyle}>{this.state.errorMessage}</Text>
            <CardItem style={styles.cardItemStyle}>
              <FacebookLoginButton
                disabled={!this.state.isConnected}
                handleLogin={this.handleLogin}
                navigate={navigate} />
            </CardItem>
            <CardItem style={styles.cardItemStyle}>
              <GoogleLoginButton
                disabled={!this.state.isConnected}
                handleLogin={this.handleLogin}
                navigate={navigate} />
            </CardItem>
          </Card>
          <Card>
            <Button
              icon={{
                type: 'material-community',
                name: 'stethoscope',
                size: 21,
              }}
              type='clear'
              disabled={!this.state.isConnected}
              title='Uzman Girişi'
              onPress={() => navigate('ProviderLoginScreen')} />
          </Card>
        </View>
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
      this.setState({ errorMessage: "Giriş yapabilmek için internet bağlantınızın olması gerekmektedir!" });
    } else {
      this.setState({ errorMessage: '' });
    }
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this._checkConnection);
    this._mounted = false;
  }
}

const styles = StyleSheet.create({
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
    fontSize: 24,
    justifyContent: 'center',
    textAlign: 'center',
    alignSelf: 'center'
  },
  stretch: {
    paddingTop: 30,
    width: 200,
    height: 50,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

/* function mapStateToProps({ auth, common }) {
  return { user: auth.user, common };
} */

export default connect(null, actions)(LoginScreen);