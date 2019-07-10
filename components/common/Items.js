import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import firebase from 'react-native-firebase';
import { ListItem } from 'react-native-elements';

import { ErrorLabel, Bold } from './Titles';

export const RowItem = (props) => {
  return (
    <View style={[styles.rowStyle, props.style]}>
      <Text style={styles.labelStyle}>{props.label || ''}</Text>
      <Text textBreakStrategy='highQuality' style={styles.contentStyle}>
        {props.content || ''}
      </Text>
      {props.children}
    </View>
  );
}

export const ColumnItem = (props) => {
  return (
    <View style={[styles.columnStyle, props.style]}>
      <Text style={styles.labelStyle}>{props.label || ''}</Text>
      <Text textBreakStrategy='highQuality' style={styles.contentStyle}>
        {props.content || ''}
      </Text>
      {props.children}
    </View>
  );
}



export class ChatItem extends Component {
  uid = firebase.auth().currentUser._user.uid;

  render() {
    const chatId = this.props.chatId;
    const theChat = this.props.data;
    console.log('chatId', chatId);
    console.log('theChat', theChat);
    /** item is a chatRoom object -> chatRoom1: { lastMessage: {...} } */
    const title = theChat.title;
    const lastMessage = theChat.lastMessage;
    let avatar = theChat.avatar;
    const isApproved = theChat.status;
    let subtitle = '';
    let userName = '';
    let badge = null;

    if (isApproved === false) return;

    if (isApproved === 'pause') {
      subtitle = <ErrorLabel>Hizmet durduruldu!</ErrorLabel>
    } else if (lastMessage) {
      if (chatId === 'commonchat') {
        userName = (lastMessage.user._id === this.uid) ? 'Siz: ' : lastMessage.user.name + ': ';
      } else {
        userName = (lastMessage.user._id === this.uid) ? 'Siz: ' : '';
      }
      if (theChat.unread > 0) badge = { value: theChat.unread, status: 'primary', textStyle: { fontSize: 15 } }
      if (lastMessage.text)
        subtitle = userName + lastMessage.text;
      else if (lastMessage.image)
        subtitle = userName + ' resim';
      else if (lastMessage.audio)
        subtitle = userName + ' sesli mesaj';


    } else {
      subtitle = "Mesaj yok! İlk mesajı siz yazın.";
    }

    return (
      <TouchableHighlight onPress={() => this.props.onPress({ chatId, title, userRole: 'c', isApproved })}>
        <ListItem
          title={title}
          titleStyle={{ fontWeight: 'bold', fontSize: 17 }}
          subtitle={subtitle}
          key={chatId}
          leftAvatar={{
            source: avatar,
            title: 'avatar title',
            //showEditButton: true,
            size: 'large',
          }}
          badge={badge}
          containerStyle={{ borderBottomWidth: 1 }}
        />
      </TouchableHighlight>
    );
  }

}


export const LabeledItem = (props) => {
  console.log('labeledItem props', props);
  return (
    <View style={{ flexDirection: 'row' }}>
      {props.label && <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{props.label}</Text>}
      {
        props.content && <Text textBreakStrategy='highQuality' style={{ fontSize: 15 }}>{props.onPress}</Text>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  rowStyle: {
    flex: 1,
    padding: 5,
    paddingLeft: 10,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#ddd',
    borderBottomWidth: 1,
    position: 'relative',
  },
  columnStyle: {
    borderWidth: 0,
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderColor: '#ddd',
    borderBottomWidth: 1,
    position: 'relative',
  },
  contentStyle: {
    flex: 2,
    fontSize: 19,
    fontFamily: 'Helvetica',
    marginRight: 10,
  },
  labelStyle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    paddingRight: 10,
    color: '#00004c',
  },
});