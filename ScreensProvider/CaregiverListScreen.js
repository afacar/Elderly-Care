import React, { Component } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Button, Card, Text, ListItem, Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import * as actions from '../appstate/actions';
import { RowItem } from '../components/common';

class CaregiverList extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Talep Listesi`,
    //headerTitleStyle: { alignContent: 'center', borderWidth: 2 },
    headerStyle: { backgroundColor: 'white', borderWidth: 1 },
  });

  state = { /** List of caregiver data who send request to provider*/
    caregivers: {}, // { caregiverId: {profile} }
  }

  _isMounted = null;

  _renderEmptyItem = () => {
    return (
      <Text>Kayıtlı hasta bulunamadı!</Text>
    );
  }

  _answerCaregiverRequest = async (caregiverId, answer) => {
    try {
      await this.props.respond_caregiver_request(caregiverId, answer);
    } catch (error) {
      console.error('_approveCaregiverRequest hatası', error.message);
    }
  }

  _cancelRequestConfirm = (caregiverId) => {
    Alert.alert('Onayınız gerekmekte!', 'Danışmanlık talebini iptal etmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          onPress: () => { },
          style: 'cancel',
        },
        { text: 'Evet', onPress: () => this._answerCaregiverRequest(caregiverId, false) },
      ],
      { cancelable: false },
    );
  }

  cancelButton = (caregiverId) => (
    <Button
      icon={{
        type: 'evilicon',
        name: "close",
      }}
      type='clear'
      title="Reddet"
      onPress={() => this._cancelRequestConfirm(caregiverId)}
    />
  );

  pauseButton = (caregiverId) => (
    <Button
      icon={{
        type: 'feather',
        name: "pause",
      }}
      type='clear'
      title="Durdur"
      onPress={() => this._answerCaregiverRequest(caregiverId, 'pause')}
    />
  );

  approveButton = (caregiverId) => (
    <Button
      icon={{
        type: 'evilicon',
        name: "check",
      }}
      type='clear'
      title="Onayla"
      onPress={() => this._answerCaregiverRequest(caregiverId, true)}
    />
  );

  resumeButton = (caregiverId) => (
    <Button
      icon={{
        type: 'feather',
        name: "play",
      }}
      type='clear'
      title="Başlat"
      onPress={() => this._answerCaregiverRequest(caregiverId, true)}
    />
  );

  _renderItem = ({ item }) => {
    const caregiverId = item;
    console.log('renderCaregiverItem caregiverId', caregiverId);
    const caregiver = this.state.caregivers[caregiverId];
    let title = caregiver.displayName || 'Adı yok!';
    let subtitle = '';
    if (caregiver.status === 'pending') {
      subtitle = (
        <View>
          <Text>Danışmanlık almak istiyor!</Text>
          <RowItem>
            {this.cancelButton(caregiverId)}
            {this.approveButton(caregiverId)}
          </RowItem>
        </View>
      );
    } else if (caregiver.status === true) {
      subtitle = (
        <RowItem>
          <Text>Danışmanlık alıyor!</Text>
          {this.pauseButton(caregiverId)}
        </RowItem>
      );
    } else if (caregiver.status === false) {
      subtitle = (
        <RowItem>
          <Text>Danışmanlık reddedildi!</Text>
          {this.resumeButton(caregiverId)}
        </RowItem>
      );
    } else if (caregiver.status === 'pause') {
      subtitle = (
        <RowItem>
          <Text>Danışmanlık durduldu!</Text>
          {this.resumeButton(caregiverId)}
        </RowItem>
      );
    }

    return (
      <ListItem
        title={title}
        subtitle={subtitle}
        leftAvatar={{
          source: caregiver.photoURL && { uri: caregiver.photoURL },
          title: caregiver.displayName
        }}
        containerStyle={{ borderBottomWidth: 2 }}
      />
    );
  }

  render() {

    return (
      <View>
        <FlatList
          data={Object.keys(this.state.caregivers)}
          renderItem={this._renderItem}
          ListEmptyComponent={this._renderEmptyItem}
          keyExtractor={(item) => item}
        />
      </View>
    );
  }

  fetchCaregivers = async () => {
    try {
      await this.props.fetch_caregivers((profile) => {
        this._isMounted && this.setState(previousState => {
          const { caregiverId } = profile;
          const { caregivers } = previousState;

          if (!caregivers[caregiverId]) caregivers[caregiverId] = {};
          caregivers[caregiverId] = profile;
          console.log('!Returning new state ', caregivers);
          return { caregivers };
        });
      });
    } catch (error) {
      console.error('CaregiverList didMount has error:', error.message);
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    this.fetchCaregivers();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default connect(null, actions)(CaregiverList);