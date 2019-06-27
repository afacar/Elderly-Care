import React from 'react';
import { AsyncStorage, TouchableHighlight, Text, View, Image } from 'react-native';
import { GiftedChat, Actions, SystemMessage, Send } from 'react-native-gifted-chat';
import { connect } from 'react-redux';
import * as actions from '../appstate/actions';
import "moment/locale/tr";

class CaregiverMessageScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.getParam('title', '')}`,
    headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    headerStyle: {
      backgroundColor: 'white',
    },
    headerForceInset: {vercical: 'never'},
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
        onSend={(message) => {
          this.props.sendMessage(userRole, message, chatId);
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
      />
    );
  }

  _renderSend = (props) => {
    return (
      <Send {...props} containerStyle={{ justifyContent: 'center' }}>
        <Text style={{ fontSize: 19, color: 'blue', margin: 5 }}>Gönder</Text>
      </Send>
    );
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
      const localMessageIds = messages.map(message => { return message._id });
      this._isMounted && this.fetch_messages(localMessageIds);
    } else {
      this._isMounted && this.setState({ messages: [] });
      this._isMounted && this.fetch_messages([]);
    }

  }

  fetch_messages = async (localMessageIds) => {
    const { chatId, userRole } = this.state;
    this.props.fetchMessages(userRole, localMessageIds, chatId, (message, isNewMessage) => {
      /** @callback */
      this._isMounted && this.setState((previousState) => {
        if (isNewMessage) return { messages: GiftedChat.append(previousState.messages, message), isNewMessage };
        return { messages: GiftedChat.append(previousState.messages, message) };
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