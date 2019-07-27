import React, {Component} from 'react';
import {ScrollView, FlatList, TouchableOpacity, Text} from 'react-native';
import {connect} from 'react-redux'
import * as actions from '../appstate/actions';
import { ListItem } from 'react-native-elements';

class ProviderArchiveScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: `Archived Chats`,
      });


      state = { /** List of archived caregiver data */
        caregivers: {}, // { caregiverId: {profile} }
      }

      _renderEmptyList = () => {
        return (
          <Text>Arşiviniz boş!</Text>
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
        this._isMounted = true;
        // Load the chatRooms with lastMessages
        await this.props.loadProviderArchives(this._fetchChatRooms);
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
          <TouchableOpacity onPress={() => this._onPressItem({ chatId, title, userRole: 'p', isApproved : false, userid: chatId, isArchived: true })}>
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
const styles ={
    containerStyle: {
      flex: 1,
      paddingTop: 15,
      backgroundColor: '#fff',
    },
  };
export default connect(null, actions)(ProviderArchiveScreen);