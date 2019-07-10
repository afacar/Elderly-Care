import React from 'react';
import { AsyncStorage, TouchableHighlight, Text, View, Image, Platform } from 'react-native';
import { Composer, GiftedChat, Actions, SystemMessage, Send } from 'react-native-gifted-chat';
import { connect } from 'react-redux';
import * as actions from '../appstate/actions';
import "moment/locale/tr";

import { ImageButton } from '../components/common/Buttons.js'
import ImagePicker from 'react-native-image-picker';
//import RNFetchBlob from 'rn-fetch-blob';
import firebase from 'react-native-firebase';


// const Blob = RNFetchBlob.polyfill.Blob;
// const fs = RNFetchBlob.fs;
// window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
// window.Blob = Blob;
// const Fetch = RNFetchBlob.polyfill.Fetch

// window.fetch = new Fetch({
//   // enable this option so that the response data conversion handled automatically
//   auto: true,
//   // when receiving response data, the module will match its Content-Type header
//   // with strings in this array. If it contains any one of string in this array, 
//   // the response body will be considered as binary data and the data will be stored
//   // in file system instead of in memory.
//   // By default, it only store response data to file system when Content-Type 
//   // contains string `application/octet`.
//   binaryContentTypes: [
//     'image/',
//     'video/',
//     'audio/',
//     'foo/',
//   ]
// }).build()

class CaregiverMessageScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.getParam('title', '')}`,
    headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    headerStyle: {
      backgroundColor: 'white',
    },
    headerForceInset: { vercical: 'never' },
  });

  _isMounted = null;

  state = {
    messages: [],
    isNewMessage: false,
    chatId: null,
    userRole: null,
    isApproved: true,
  };

  render() {
    const { chatId, userRole, messages, isApproved } = this.state;
    return (
      <GiftedChat
        key={chatId}
        messages={messages}
        locale='tr'
        onSend={ async (message) => {
          this.sendMessage(message);
        }}
        renderInputToolbar={isApproved === 'pause' ? () => null : undefined}
        showUserAvatar={true}
        user={{
          _id: this.props.getUid(),
          name: this.props.getName(),
          avatar: this.props.getPhotoURL(),
        }}
        placeholder='Mesaj yazın...'
        renderSend={this._renderSend}
        renderComposer={this.renderComposer}
        alwaysShowSend
      />
    );
  }

  renderComposer = props => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 4 }}>
        <Composer {...props} />
        <ImageButton onPress={this.openPicker} />

      </View>
    );
  }

  _renderSend = (props) => {
    return (
      <Send {...props} containerStyle={{ justifyContent: "center", flex: 2 }}>
        <Text style={{ fontSize: 19, color: 'blue', margin: 5 }}>Gönder</Text>
      </Send>
    );
  }

  openPicker = () => {

    // More info on all the options is below in the API Reference... just some common use cases shown here
    const options = {
      title: 'Fotoğraf Seç',
      storageOptions: {
        skipBackup: true,
        path: 'images',
        allowsEditing: true,
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);

      }
      else {
        // const source = { uri: response.path }
        // this.setState({
        //   imageMessageSrc: source
        // });
        const message = {
          text: "",
          user: {
            _id: this.props.getUid(),
            name: this.props.getName(),
            avatar: this.props.getPhotoURL(),
          },
          image: response.uri.toString(),
        };
        if (Platform.OS === 'ios'){
          message.path = message.image.replace("file://", '');
        }
        this.sendMessage([message]);
      }
    });
  }

  sendMessage = async(messages) => {
    let messagesArray = [];
    for ( let i = 0; i< messages.length; i++) {
      let message = messages[i];
      message.createdAt = new Date().getTime();
      message._id = this.randIDGenerator();
      await this.updateState(message);
      messagesArray.push(message);
    }
    const { chatId, userRole, } = this.state;
    this.props.sendMessage(userRole, messagesArray, chatId);
  }
 
  updateState (message) {
    this.setState((previousState) => {
      console.log("Message:",message);
    return { messages: GiftedChat.append(previousState.messages, message)}
    });
  }


  randIDGenerator = () => {
    var date = new Date().getTime().toString();
    var randId = this.props.getUid() + date;
    return (randId);
  }

  async componentDidMount() {
    this._isMounted = true;

    const userRole = this.props.navigation.getParam('userRole', '');
    const chatId = this.props.navigation.getParam('chatId', '');
    //const userid = this.props.navigation.getParam('userid', '');
    const title = this.props.navigation.getParam('title', '');
    const isApproved = this.props.navigation.getParam('isApproved', '');
    console.log(`MessageScreen Mounted with chatId: ${chatId} and title: ${title}`);
    if (chatId) {
      this.setState({ chatId, title, userRole, isApproved });
      this.load_messages(chatId);
    }
  }

  load_messages = async (chatId) => {
    //const { chatId } = this.state;
    console.log("load_messages is invoked!", chatId);
    /** load previous messages from local */
    let messageData = '';
    try {
      messageData = await AsyncStorage.getItem(chatId);
    } catch (error) {
      console.error(`${chatId} ait local data okunurken data`, error.message);
    }
    if (messageData) {
      let messages = await JSON.parse(messageData);
      this._isMounted && this.setState({ messages });
      this._isMounted && this.fetch_messages();
    } else {
      this._isMounted && this.setState({ messages: [] });
      this._isMounted && this.fetch_messages([]);
    }

  }

  fetch_messages = async (localMessageIds) => {
    const { chatId, userRole } = this.state;
    this.props.fetchMessages(userRole, localMessageIds, chatId, (message) => {
      /** @callback */
      this._isMounted && this.setState((previousState) => {
        var allMessages = this.state.messages;
        var exists = false;
        allMessages.forEach(element => {
          console.log(element);
            if ( element._id === message._id)
              exists = true;
        })
        if ( !exists) {
          return { messages: GiftedChat.append(previousState.messages, message) }
        }
      });
    });
  }

  save_messages = async () => {
    const { chatId, messages, isNewMessage } = this.state;
    /** save previous messages to local */
    if (isNewMessage) {
      let messageData = await JSON.stringify(messages);
      AsyncStorage.setItem(chatId, messageData)
        .then(() => console.log(`Messages of ${chatId} are saved Successfully to local storage`))
        .catch(error => console.error(`${chatId} local saving has Error!`, error.message));
    }
  }

  componentWillUnmount() {
    const { chatId, userRole } = this.state;
    console.log(`Messages of ${chatId} is saving to local storage...`);
    this.save_messages();
    console.log("CommonChat is unmounting...");
    this.props.closeChat(chatId, userRole);

    this._isMounted = false;
  }

}

/* function mapStateToProps({ chat, common }) {
  return { message: chat.message, common };
} */

export default connect(null, actions)(CaregiverMessageScreen);