/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import { LoginButton, AccessToken } from "react-native-fbsdk";
import Icon from 'react-native-vector-icons/Ionicons';
import ActionButton from "react-native-action-button";
import { Agenda } from "react-native-calendars";
import { GiftedChat } from 'react-native-gifted-chat';
import DateTimePicker from "react-native-modal-datetime-picker";
import Toast, { DURATION } from 'react-native-easy-toast';
import Voice from 'react-native-voice';
import { VictoryBar } from "victory-native";
import { ScrollView } from 'react-native-gesture-handler';
import { createAppContainer, createStackNavigator, createMaterialTopTabNavigator } from 'react-navigation';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

export default class App extends Component {

  render() {
    return (
      <View style={styles.container}>
        <AppContainer />
      </View>
    );
  }
}

class Home extends Component {
  state = {
    messages: [],
  }

  componentWillMount() {
    this.setState({
      isDateTimePickerVisible: false,
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };

  handleDatePicked = date => {
    console.log("A date has been picked: ", date);
    this.hideDateTimePicker();
  };
  
  signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    this.setState({ userInfo });
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (f.e. sign in) is in progress already
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
    } else {
      // some other error happened
    }
  }
};

  render() {
    return (
      <View>
        <Toast ref="toast" />
        <Button title="Show Toaster" onPress={() => this.refs.toast.show('hello world!')} />
        <Button title="Show DatePicker" onPress={this.showDateTimePicker} />
        <DateTimePicker
          mode="datetime"
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked}
          onCancel={this.hideDateTimePicker}
          datePickerModeAndroid="spinner"
          timePickerModeAndroid="spinner"
        />
        <LoginButton
          onLoginFinished={
            (error, result) => {
              if (error) {
                console.log("login has error: " + result.error);
              } else if (result.isCancelled) {
                console.log("login is cancelled.");
              } else {
                AccessToken.getCurrentAccessToken().then(
                  (data) => {
                    console.log(data.accessToken.toString())
                  }
                )
              }
            }
          }
          onLogoutFinished={() => console.log("logout.")} />
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={this.signIn}
          disabled={this.state.isSigninInProgress} />
        <Button title="Go to chat" onPress={() => this.props.navigation.navigate('Chat')} />
        <Button title="Go to chart" onPress={() => this.props.navigation.navigate('Chart')} />
      </View>
    );
  }
}

class Chat extends Component {
  state = {
    messages: [],
  };

  componentDidMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ]
    });
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: 1,
        }}
      />
    );
  }
}

class Chart extends Component {

  render() {
    return (
      <View pointerEvents="none">
        <VictoryBar />
      </View>
    );
  }
}

const AppNavigator = createMaterialTopTabNavigator({
  Home: Home,
  Chat: Chat,
  Chart: Chart,
});

const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'purple',
    backgroundColor: '#F5FCFF',
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    marginBottom: Platform.OS === 'ios' ? 10 : 0
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
