import React, { Component } from 'react';
import { ScrollView, FlatList, TouchableOpacity, Text, View, Alert } from 'react-native';
import { connect } from 'react-redux'
import * as actions from '../appstate/actions';
import { ListItem } from 'react-native-elements';

class ProviderArchiveScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Arşiv`,
  });


  state = { /** List of archived caregiver data */
    caregivers: {}, // { caregiverId: {profile} }
  }

  _renderEmptyList = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, alignSelf: 'center', textAlign: 'center' }}>Arşiviniz boş! Mesajları arşivlemek için ana sayfadaki mesajın üzerine basılı tutun!</Text>
      </View>
    );
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
    const { chatId, title, avatar } = chat;
    this._isMounted && this.setState(previousState => {
      var { chats } = previousState;

      if (!chats[chatId]) chats[chatId] = {}

      chats[chatId]['title'] = title;
      chats[chatId]['avatar'] = avatar;

      var sortable = [];
      for (var chatID in chats) {
        var chat = chats[chatID];
        chat.chatId = chatID;
        chats[chatID] = chat;
        sortable.push(chats[chatID]);
      }
      return { chats }
    });
  }

  async componentDidMount() {
    this._isMounted = true;
    // Load the chatRooms with lastMessages
    await this.props.loadProviderArchives(this._fetchChatRooms);
  }

  unArchiveChat = (chatId) => {
    const chats = this.state.chats;
    delete chats[chatId];
    this.setState({ chats })
    this.props.unArchiveChat(chatId)
  }
  /*
    This function shows an alert box to user to verify whether to archive the chat or not 
    input parameter chatId indicates id and displayName of caregiver
  */
  showArchiveDialog = (chatData) => {
    Alert.alert(
      `${chatData.title} ile olan mesajlar arşivden çıkarılsın mı?`,
      `Ana ekranda kişinin adına basılı tutarak tekrar arşivleyebilirsiniz.`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'ARŞİVDEN ÇIKAR',
          onPress: () => { this.unArchiveChat(chatData.chatId) }
        }
      ],
      { cancelable: true },
    )
  }

  _onPressItem = (data) => {
    this.props.navigation.navigate('ProviderMessageScreen', data);
  }

  _renderItem = ({ item }) => {
    const chatId = item;
    const theChat = this.state.chats[chatId]
    /** item is a chatRoom object -> chatRoom1: { lastMessage: {...} } */
    const title = theChat.title;
    let avatar = theChat.avatar;

    return (
      <TouchableOpacity
        onLongPress={() => { this.showArchiveDialog({ chatId, title }) }}
        onPress={() => this._onPressItem({ chatId, title, userRole: 'p', isApproved: false, userid: chatId, isArchived: true })}>
        <ListItem
          title={title}
          titleStyle={{ fontWeight: 'bold', fontSize: 18 }}
          key={chatId}
          leftAvatar={{
            source: avatar,
            title: 'avatar title',
            size: 'large',
          }}
          containerStyle={{ borderBottomWidth: 1, }}
        />
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <ScrollView style={styles.containerStyle}>
        <FlatList
          data={Object.keys(this.state.chats)}
          renderItem={this._renderItem}
          ListEmptyComponent={this._renderEmptyList}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    );
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
}
const styles = {
  containerStyle: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
};
export default connect(null, actions)(ProviderArchiveScreen);