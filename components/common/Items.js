import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import firebase from 'react-native-firebase';
import { ListItem, Icon } from 'react-native-elements';
import { respond_caregiver_request } from '../../appstate/actions';
import { TouchableOpacity } from 'react-native-gesture-handler';
import _ from 'lodash';
import { ErrorLabel, Bold } from './Titles';
import { RightButton } from './Buttons';
import { CardItem } from './CardItem';

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
    //console.log('chatId', chatId);
    console.log('ChatItem render->', theChat);
    /** item is a chatRoom object -> chatRoom1: { lastMessage: {...} } */
    const title = theChat.title;
    const lastMessage = theChat.lastMessage;
    let avatar = theChat.avatar;
    const isApproved = theChat.status;
    const firstTime = theChat.firstTime;
    const userRole = theChat.userRole;

    let subtitle = '';
    let userName = '';
    let badge = null;

    if (isApproved === 'End') {
      subtitle = <ErrorLabel>Oturum bitti!</ErrorLabel>
    } else if (isApproved === 'Pending') {
      subtitle = (
        <CardItem>
          <Text>Onay bekliyor!</Text>
        </CardItem>
      )
    } else {
      // isApproved can be Approve or Reject, Cancel with lastMessage
      if (lastMessage) {
        if (chatId === 'commonchat') {
          console.log('Muhtemel error yeri lastMessage=>', lastMessage);
          userName = (lastMessage.user._id === this.uid) ? 'Siz: ' : lastMessage.user.name + ': ';
        } else {
          userName = (lastMessage.user._id === this.uid) ? 'Siz: ' : '';
        }
        if (theChat.unread > 0) 
          badge = { value: theChat.unread, status: 'primary', textStyle: { fontSize: 15 } }
        if (lastMessage.text)
          subtitle = userName + lastMessage.text;
        else if (lastMessage.image)
          subtitle = userName + '📷 Resim';
        else if (lastMessage.audio)
          subtitle = userName + '🎤 Sesli mesaj';
      } else {
        subtitle = "Mesaj yok! İlk mesajı siz yazın.";
      }
    }

    return (
      <TouchableOpacity onPress={() => this.props.onPress({ chatId, title, userRole, isApproved, firstTime })}
      onLongPress={() => this.props.onLongPress({chatId, title})}
      >
        <ListItem
          title={title}
          titleStyle={{ fontWeight: 'bold', fontSize: 17 }}
          subtitle={subtitle}
          leftAvatar={{
            source: avatar,
            title,
            //showEditButton: true,
            size: 'medium',
          }}
          badge={badge}
          containerStyle={{ borderBottomWidth: 0.5, borderBottomEndRadius: 50, borderBottomStartRadius: 100 }}
        />
      </TouchableOpacity>
    );
  }
}

export const LabeledItem = (props) => {
  console.log('labeledItem props', props);
  return (
    <View style={{ flexDirection: 'row' }}>
      {props.label && <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{props.label}</Text>}
      {
        props.content && <Text textBreakStrategy='highQuality' style={{ fontSize: 15 }}>{props.content}</Text>
      }
    </View>
  );
}

export const SettingsItem = (props) => {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', flex: 1 }} onPress={props.onPress}>
      <Text style={{ alignSelf: 'flex-start', color: 'grey', fontSize: 18, paddingLeft: 10, padding: 5 }}>{props.text}</Text>
      <RightButton onPress={props.onPress} />
    </TouchableOpacity>
  )
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