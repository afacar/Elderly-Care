import React from 'react';
import { ScrollView, StyleSheet, FlatList, TouchableHighlight, View, Text, Image } from 'react-native';
import { ListItem } from 'react-native-elements';
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
      <TouchableHighlight onPress={() => navigation.navigate('CaregiverList')}>
        <View style={{ alignSelf: 'flex-end', alignItems: 'center', marginRight: 10 }}>
          <Image
            style={{ width: 40, height: 40 }}
            source={require('../assets/images/family.png')}
          />
          <Text style={{ fontWeight: 'bold' }}>Danışmanlık Talepleri</Text>
        </View>
      </TouchableHighlight>
    )
  });

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
      const { chats } = previousState;

      if (!chats[chatId]) chats[chatId] = {}

      chats[chatId]['lastMessage'] = lastMessage;
      chats[chatId]['title'] = title;
      chats[chatId]['status'] = status;
      chats[chatId]['avatar'] = avatar;
      chats[chatId]['unread'] = unread;

      return { chats };
    });
  }

  async componentDidMount() {
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
      subtitle = <Text>{userName + ' ' + lastMessage.text}</Text>;
      if (theChat.unread > 0) badge = { value: theChat.unread, status: 'primary', textStyle: { fontSize: 18 } }
    } else {
      subtitle = "Mesaj yok! İlk mesajı siz yazın."
    }

    return (
      <TouchableHighlight onPress={() => this._onPressItem({ chatId, title, userRole: 'p', isApproved, userid: chatId })}>
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
      </TouchableHighlight>
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

