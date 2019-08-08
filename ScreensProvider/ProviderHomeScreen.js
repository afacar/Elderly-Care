import React from 'react';
import { ScrollView, StyleSheet, FlatList, TouchableOpacity, View, Text, Image } from 'react-native';
import { ListItem, Badge, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
import firebase from 'react-native-firebase';
import * as actions from '../appstate/actions';
import { ChatItem } from '../components/common';

class ProviderHome extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Hastalarım`,
    headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    headerStyle: {
      backgroundColor: 'white',
    },
    headerRight: (
      <TouchableOpacity onPress={() => navigation.navigate('CaregiverList')}>
        <View style={{ alignSelf: 'flex-end', alignItems: 'center', marginRight: 10 }}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Image
              style={{ width: 40, height: 40 }}
              source={require('../assets/images/family.png')}
            />
            <Badge status="primary" value={navigation.getParam('newRequests', 0)} />
          </View>
          <Text style={{ fontWeight: 'bold' }}>Danışmanlık Talepleri</Text>
        </View>
      </TouchableOpacity>
    )
  });

  renderBadge = () => {
    console.log("LOG3");
    const { newRequests } = this.state
    console.log("LOG3", newRequests);
    if (newRequests && newRequests !== 0)
      return <Badge status="primary" value={this.state.newRequests} />
  }

  componentWillMount() {
    this.props.fetch_requests((newRequests) => {
      console.log("LOG2", newRequests);
      this.props.navigation.setParams({
        newRequests: newRequests
      })
    })
  }

  _isMounted = false;

  state = {
    chats: {
      //CommonChat: {},
      // ProviderChatKey: { title: 'ProviderChat', lastMessage: {} },
      /** 
       * chatId1: { title: 'uzman memet', lastMessage: {} },
       * chatId2: ...
       */
    }
  }

  _setChats = (chat) => {
    const { chatId, title, lastMessage, status, unread, avatar } = chat;
    console.log('_setChats at ProviderHomeScreen', chat);
    this._isMounted && this.setState(previousState => {
      var { chats } = previousState;

      if (!chats[chatId]) chats[chatId] = {}

      chats[chatId]['lastMessage'] = lastMessage;
      chats[chatId]['title'] = title;
      chats[chatId]['status'] = status;
      chats[chatId]['avatar'] = avatar;
      chats[chatId]['unread'] = unread;

      var sortable = [];
      for (var chatID in chats) {
        var chat = chats[chatID];
        chat.chatId = chatID;
        chats[chatID] = chat;
        sortable.push(chats[chatID]);
      }
      var sortedChats = {}
      sortable.sort(this.compareChats);
      for (var i = 0; i < sortable.length; i++) {
        var tmpChat = sortable[i];
        sortedChats[tmpChat.chatId] = tmpChat;
        delete sortedChats[tmpChat.chatId].chatId;
      }
      chats = sortedChats;
      return { chats };
    });
  }

  compareChats(chat1, chat2) {
    if (chat1.lastMessage.createdAt > chat2.lastMessage.createdAt)
      return -1;
    if (chat1.lastMessage.createdAt < chat2.lastMessage.createdAt)
      return 1;
    return 0;
  }

  _onPressItem = (chatdata) => {
    console.log("We now navigate to MessageScreen with key", data);
    const data = {...chatdata, userRole: 'p'};
    this.props.navigation.navigate('ProviderMessageScreen', data);
  }

  _handleRequest = async (caregiverId, response) => {
    console.log('respondResquest caregiverId', caregiverId, response);
    console.log('respondResquest caregiverId', caregiverId, response);
    try {
      await this.props.respond_caregiver_request(caregiverId, response);
    } catch (error) {
      console.log('this.props.respond_caregiver_request hatası', error.message);
    }
  }

   _renderItem = ({ item }) => {

    const chatId = item;
    const theChat = this.state.chats[chatId];
    console.log("_renderItem", theChat);
    const isApproved = theChat.status;

    if (isApproved === false) return;

    console.log('_renderItem2');
    return (
      /* <ListItem
        title={theChat.title + ' ' + theChat.unread}
        subtitle={theChat.lastMessage.text}
      /> */
      <ChatItem
        onPress={this._onPressItem}
        //key={chatId}
        handleRequest={this._handleRequest}
        chatId={chatId}
        data={theChat} />
    )
  }

  _renderEmptyItem = () => {
    return (
      <ListItem
        title="Sohbet bulunamadı!"
        subtitle="Sohbet için Bakıcı ekleyin ya da genel sohbet grubuna girin!"
        key="NOITEM"
      />
    );
  }

  render() {
    console.log('ProviderHomeScreen Rerendering...');
    return (
      <ScrollView style={styles.containerStyle}>
        <FlatList
          data={Object.keys(this.state.chats)}
          renderItem={this._renderItem}
          ListEmptyComponent={this._renderEmptyItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    );
    
  }

  async componentDidMount() {
    this._isMounted = true;
    // Load the chatRooms with lastMessages
    await this.props.loadProviderChats(this._setChats);
  }

  componentWillUnmount() {
    console.log('ProviderHomeScreen UNMounted!');
    this._isMounted = false;
  }

}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});

/* function mapStateToProps({ chat }) {
  return { chat };
} */

export default connect(null, actions)(ProviderHome);

