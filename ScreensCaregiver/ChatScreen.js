import React from 'react';
import { ScrollView, View, StyleSheet, FlatList, TouchableHighlight, Image } from 'react-native';
import { ListItem, Text, Badge } from 'react-native-elements';
import { connect } from 'react-redux';
import firebase from 'react-native-firebase';
import "moment/locale/tr";
import TabBarIcon from "../components/TabBarIcon";
import * as actions from '../appstate/actions';
import { ErrorLabel, ChatItem } from '../components/common';
import { SafeAreaView } from 'react-navigation';

class ChatScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `İletişim`,
    headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    headerStyle: {
      backgroundColor: 'white',
    },
    headerForceInset: {vercical: 'never'},
    headerRight: (
     
      <TouchableHighlight onPress={() => navigation.navigate('ProviderListScreen')}>
        <View style={{ alignSelf: 'flex-end', alignItems: 'center', marginRight: 10 }}>
          <Image
            style={{ width: 25, height: 25 }}
            source={require('../assets/images/doctor2.png')}
          />
          <Text style={{ fontWeight: 'bold' }}>Uzman Ekle</Text>
        </View>
      </TouchableHighlight>
    ),
  });

  state = {
    chats: {
      //CommonChat: {},
      // ProviderchatId: { title: 'ProviderChat', lastMessage: {} },
      /** 
       * chatId1: { title: 'uzman memet', lastMessage: {} },
       * chatId2: ...
       */
    }
  }

  _setChatRooms = (chat) => {
    const { chatId, title, lastMessage, status, avatar, unread } = chat;
    this.setState(previousState => {
      const { chats } = previousState;

      if (!chats[chatId]) chats[chatId] = {};
      chats[chatId]['lastMessage'] = lastMessage;
      chats[chatId]['title'] = title;
      chats[chatId]['status'] = status;
      chats[chatId]['unread'] = unread;
      chats[chatId]['avatar'] = avatar;

      return { chats };
    });
    console.log('newChat is fetched and state updated->', this.state);
  }

  async componentDidMount() {
    // Load the chatRooms with lastMessages
    await this.props.loadCaregiverChats(this._setChatRooms);
  }

  _onPressItem = (data) => {
    this.props.navigation.navigate('CaregiverMessageScreen', data);
  }

  _renderItem = ({ item }) => {

    const chatId = item;
    const theChat = this.state.chats[chatId];
    const isApproved = theChat.status;
    
    if (isApproved === false) return;

    return (
      <ChatItem
        onPress={this._onPressItem}
        key={chatId}
        chatId={chatId}
        data={theChat} />
    )
  }

  _renderEmptyItem = () => {
    return (
      <ListItem
        title="Sohbet bulunamadı!"
        subtitle="Sohbet için Uzman ekleyin ya da genel sohbet grubuna girin!"
        key="NOITEM"
      />
    );
  }

  render() {
    /** 2 return cases: loading and, chat list */
    return (
      <ScrollView  style={styles.containerStyle}>
        <FlatList
          data={Object.keys(this.state.chats)}
          renderItem={this._renderItem}
          ListEmptyComponent={this._renderEmptyItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    );
  }

}

/* function mapStateToProps({ chat }) {
  return { chat };
} */

export default connect(null, actions)(ChatScreen);

const styles = StyleSheet.create({
  containerStyle: {
    //flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});

