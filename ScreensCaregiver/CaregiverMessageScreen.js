import React from 'react';
import { AsyncStorage, TouchableOpacity, Text, View, Platform } from 'react-native';
import { Composer, GiftedChat, Send, Bubble } from 'react-native-gifted-chat';
import { connect } from 'react-redux';
import * as actions from '../appstate/actions';
import "moment/locale/tr";

import { ImageButton, AttachmentButton, CameraButton, MicButton } from '../components/common/Buttons.js'
import ImagePicker from 'react-native-image-picker';

import CircleTransition from 'react-native-circle-reveal-view';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { AudioUtils, AudioRecorder } from 'react-native-audio';
import { PermissionsAndroid } from 'react-native';
import AudioCard from '../components/common/AudioCard';


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

  cameraOptions = {
    title: 'Fotoğraf Seç',
    storageOptions: {
      skipBackup: true,
      path: 'images',
      allowsEditing: true,
    },
  };
  state = {
    messages: [],
    isNewMessage: false,
    chatId: null,
    userRole: null,
    isApproved: true,
    userIsTyping: false,
    hasPermission: false,
    startAudio: false,
    audioPlaying: false,
    fetchChats: false,
    audioSettings: {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "High",
      AudioEncoding: "aac",
      MateringEnabled: true,
      IncludeBase64: true,
      AudioEncodingBitRate: 32000
    },
    currentAudioId: ""
  };

  changeTypeState = (text) => {
    var typing = false;
    if (text) {
      typing = true;
    }
    this.setState({
      userIsTyping: typing
    })
  }

  render() {
    const { chatId, userRole, messages, isApproved } = this.state;
    return (
      <GiftedChat
        key={chatId}
        messages={messages}
        locale='tr'
        onSend={async (message) => {
          this.sendMessage(message);
        }}
        onInputTextChanged={(text) => { this.changeTypeState(text) }}
        style={{ width: '100%', alignItems: 'center' }}
        renderInputToolbar={isApproved === 'pause' ? () => null : undefined}
        showUserAvatar={false}
        user={{
          _id: this.props.getUid(),
          name: this.props.getName(),
          avatar: this.props.getPhotoURL(),
        }}
        placeholder='Mesaj yazın...'
        renderBubble={this.renderBubble}
        renderSend={this._renderSend}
        // renderComposer={this.renderComposer}
        renderActions={this.renderActions}
        onPressAvatar={this.onPressAvatar}
      // alwaysShowSend
      />
    );
  }

  onPressAvatar = (props) => {
    console.log("Avatar clicked ", props);
  }

  renderAudio = (props) => {
    return !props.currentMessage.audio ? (
      <View />
    ) : (
        <AudioCard
          id={props.currentMessage._id}
          audio={props.currentMessage.audio}
          createdAt={props.currentMessage.createdAt}
        />
      );
  };


  renderBubble = props => {
    if (props.currentMessage.audio) {
      return (
        <View>
          {this.renderAudio(props)}
        </View>
      )
    } else {
      return (
        <View>
          <Bubble {...props} />
        </View>
      );
    }
  };

  renderActions = props => {
    if (!this.state.userIsTyping) {
      return (
        <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <AttachmentButton onPress={() => { this.transitedView.toggle() }} />

            <CircleTransition
              ref={(ref) => this.transitedView = ref}
              backgroundColor={'#EEEBE9'}
              duration={100}
              style={{ position: 'absolute', bottom: 48, right: 8, left: 8, width: '1000%', borderRadius: 8 }}
              revealPositionArray={{ bottom: true, left: true }}// must use less than two combination e.g bottom and left or top right or right
            >
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <View style={{ flex: 1 }}>
                </View>
                <View style={{ flex: 1 }}>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity onPress={this.openGallery}>
                    <ImageButton />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <View style={{ flex: 1 }}>
                </View>
                <View style={{ flex: 1 }}>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity onPress={this.openCamera}>
                    <CameraButton />
                  </TouchableOpacity>
                </View>
              </View>
            </CircleTransition>
          </View>
          <View style={{ flex: 1 }} >
            <TouchableOpacity onPress={this.handleAudio}>
              <MicButton onPress={this.handleAudio} isListening={this.state.startAudio} />
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  handleAudio = async () => {

    user = {
      _id: this.props.getUid(),
      name: this.props.getName(),
      avatar: this.props.getPhotoURL(),
    }
    if (!this.state.startAudio) {
      this.setState({
        startAudio: true
      });
      const audioPath = `${
        AudioUtils.DocumentDirectoryPath}/${this.randIDGenerator()}test.acc`;
      await AudioRecorder.prepareRecordingAtPath(
        audioPath,
        this.state.audioSettings
      );
      await AudioRecorder.startRecording();

    } else {
      this.setState({ startAudio: false });

      await AudioRecorder.stopRecording();
      AudioRecorder.onFinished = data => {

        const audioPath = `${
          AudioUtils.DocumentDirectoryPath}/${this.randIDGenerator()}test.acc`;

        const fileName = `${this.randIDGenerator()}.aac`;
        const file = {
          uri: Platform.OS === 'ios' ? audioPath : `file://${audioPath}`,
          name: fileName,
          type: `audio/aac`
        }
        const message = {
          text: '',
          audio: data.audioFileURL,
          image: '',
          user: {
            _id: this.props.getUid(),
            name: this.props.getName(),
            avatar: this.props.getPhotoURL(),
          },
        }
        this.sendMessage([message]);
      };
    }
  }


  renderComposer = props => {
    return (
      <Composer {...props} style={{ margin: 30 }} />
    );
  }

  _renderSend = (props) => {
    return (
      <Send {...props} containerStyle={{ justifyContent: "center" }}>
        <Text style={{ fontSize: 19, color: 'blue', margin: 5 }}>Gönder</Text>
      </Send>
    );
  }

  openCamera = () => {
    ImagePicker.launchCamera(this.cameraOptions, (response) => {
      this.onImageResult(response);
    })
  }

  openGallery = () => {
    ImagePicker.launchImageLibrary(this.cameraOptions, (response) => {
      this.onImageResult(response);
    })
  }

  onImageResult = (response) => {

    this.transitedView.collapse();
    // More info on all the options is below in the API Reference... just some common use cases shown here



    if (response.didCancel) {
    }
    else if (response.error) {
    }
    else if (response.customButton) {
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
        path: response.path.toString()
      };
      this.sendMessage([message]);
    }
  }

  sendMessage = async (messages) => {
    let messagesArray = [];
    for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      message.createdAt = new Date().getTime();
      message._id = this.randIDGenerator();
      await this.updateState(message);
      messagesArray.push(message);
    }
    const { chatId, userRole, } = this.state;
    this.props.sendMessage(userRole, messagesArray, chatId);
  }

  updateState(message) {
    this.setState((previousState) => {
      return { messages: GiftedChat.append(previousState.messages, message) }
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
    if (chatId) {
      this.setState({ chatId, title, userRole, isApproved });
      this.load_messages(chatId);
    }

    // preparation for Audio
    this.checkPermission().then(async hasPermission => {
      this.setState({ hasPermission });
      if (!hasPermission) return;

    });
  }

  // Permission check for microphone access
  checkPermission() {
    if (Platform.OS !== "android") {
      return Promise.resolve(true);
    }
    const rationale = {
      title: "Microphone Permission",
      message:
        "AudioExample needs access to your microphone so you can record audio."
    };
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      rationale
    ).then(result => {
      return result === true || result === PermissionsAndroid.RESULTS.GRANTED;
    });
  }

  load_messages = async (chatId) => {
    //const { chatId } = this.state;
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
          if (element._id === message._id)
            exists = true;
        })
        if (!exists) {
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
    this.save_messages();
    this.props.closeChat(chatId, userRole);

    this._isMounted = false;
  }
}

/* function mapStateToProps({chat, common }) {
  return {message: chat.message, common };
          } */

export default connect(null, actions)(CaregiverMessageScreen);