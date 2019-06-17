import React, { Component } from 'react';
import { ActivityIndicator, Text, TextInput } from 'react-native';
import { Card } from 'react-native-elements';
import { connect } from 'react-redux';

import * as actions from '../appstate/actions';
import { SubmitButton, CardItem } from '../components/common';

class RegisterScreen extends Component {
  state = {
    email: '',
    password: '',
    repassword: '',
    error: '',
    loading: false,
  };

  static navigationOptions = {
    title: 'Kayıt ekranı',
  };

  _mounted = false;

  registerUserWithEmail = async () => {
    const { email, password, repassword } = this.state;
    this.setState({ loading: true });
    try {
      let user = await this.props.registerUser({ email, password, repassword });
      this.props.navigation.navigate('Main');
    } catch (error) {
      this.setState({ error });
    }
    this.setState({ loading: false });
  };

  render() {
    return (
      <Card style={styles.container} >
        <Text style={styles.labelStyle}>{this.state.error}</Text>
        <TextInput
          keyboardType="email-address"
          placeholder="Email adresi"
          onChangeText={email => this.setState({ email })}
        />
        <TextInput
          placeholder="Şifre"
          onChangeText={password => this.setState({ password })}
          secureTextEntry
        />
        <TextInput
          placeholder="Tekrar Şifre"
          onChangeText={repassword => this.setState({ repassword })}
          secureTextEntry
        />
        <CardItem style={styles.cardItemStyle} >
          {this.state.loading && <ActivityIndicator />}
        </CardItem>
        <SubmitButton
          title="Kaydol"
          onPress={this.registerUserWithEmail}
        />
      </Card>
    );
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  cardItemStyle: {
    justifyContent: 'center',
  },
  labelStyle: {
    color: 'red',
    fontSize: 18,
    justifyContent: 'center',
  }
};

export default connect(null, actions)(RegisterScreen);