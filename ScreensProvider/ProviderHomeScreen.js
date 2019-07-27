import React from 'react';
import { ScrollView, StyleSheet, FlatList, TouchableOpacity, View, Text, Image } from 'react-native';
import { ListItem, Badge } from 'react-native-elements';
import { connect } from 'react-redux';
import firebase from 'react-native-firebase';
import * as actions from '../appstate/actions';
import { Icon } from '../components/common';

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

  _fetchChatRooms = (chat) => {
    const { chatId, title, lastMessage, status, unread, avatar } = chat;
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
      return { chats }
    });
  }

  compareChats(chat1, chat2) {
    if (chat1.lastMessage.createdAt > chat2.lastMessage.createdAt)
      return -1;
    if (chat1.lastMessage.createdAt < chat2.lastMessage.createdAt)
      return 1;
    return 0;
  }

  async componentDidMount() {
    console.log('ProviderHomeScreen Mounted!');
    this._isMounted = true;
    // Load the chatRooms with lastMessages
    await this.props.loadProviderChats(this._fetchChatRooms);
  }

  _onPressItem = (data) => {
    console.log("We now navigate to MessageScreen with key", data);
    this.props.navigation.navigate('ProviderMessageScreen', data);
  }

  _renderItem = ({ item }) => {
    const chatId = item;
    const theChat = this.state.chats[chatId]
    /** item is a chatRoom object -> chatRoom1: { lastMessage: {...} } */
    console.log('RenderItem theChat', theChat);
    const title = theChat.title;
    const lastMessage = theChat.lastMessage;
    let avatar = theChat.avatar;
    const isApproved = theChat.status;
    const unread = theChat.unread;
    let subtitle = '';
    let userName = '';
    let badge = null;

    if (isApproved === false) return;

    if (isApproved === 'pause') {
      subtitle = <Text style={{ color: 'red' }}>Hizmet durduruldu!</Text>
    } else if (lastMessage) {
      if (chatId === 'commonchat') {
        userName = (lastMessage.user._id === firebase.auth().currentUser._user.uid) ? 'Siz:' : lastMessage.user.name + ':';
      } else {
        userName = (lastMessage.user._id === firebase.auth().currentUser._user.uid) ? 'Siz:' : '';
      }
      if (lastMessage.text)
        subtitle = <Text>{userName + ' ' + lastMessage.text}</Text>;
      else if (lastMessage.image)
        subtitle = <Text>{userName + ' resim'}</Text>;
      else if (lastMessage.audio)
        subtitle = <Text>{userName + ' sesli mesaj'}</Text>;

      if (unread > 0) badge = { value: unread, status: 'primary', textStyle: { fontSize: 18 } }
    } else {
      subtitle = "Mesaj yok! İlk mesajı siz yazın."
    }

    return (
      <TouchableOpacity onPress={() => this._onPressItem({ chatId, title, userRole: 'p', isApproved, userid: chatId, isArchived: false })}>
        <ListItem
          title={title}
          titleStyle={{ fontWeight: 'bold', fontSize: 18 }}
          subtitle={subtitle}
          key={chatId}
          leftAvatar={{
            source: avatar,
            title: 'avatar title',
            //showEditButton: true,
            size: 'large',
          }}
          containerStyle={{ borderBottomWidth: 1, }}
          badge={badge}
        />
      </TouchableOpacity>
    );
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

