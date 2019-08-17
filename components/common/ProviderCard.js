import React, { Component } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-elements';
import { connect } from 'react-redux';

import { RowItem, ColumnItem } from "../../components/common/Items";
import * as actions from '../../appstate/actions';
import { CheckIcon, RequestIcon } from '../../components/common/Icons';


class ProviderCard extends Component {
  state = {
    errorMessages: {}
  }

  _sendProviderRequest = async (providerId, fee) => {
    try {
      await this.props.send_provider_request(providerId, fee, (result) => {
        console.log("Result", result)
        var errors = this.state.errorMessages;
        if (result == 'failure')
          errors[providerId] = "Cüzdanınızda yeterli miktarda para bulunmamaktadır"
        this.setState({
          errorMessages: errors
        })
      });
    } catch (error) {
      console.error('this.props.send_provider_request(providerId) hatası', error.message);
    }
  }

  _cancelProviderRequest = async (providerId) => {
    try {
      await this.props.cancel_pending_request(providerId);
    } catch (error) {
      console.error('this.props.cancel_pending_request(providerId) hatası', error.message);
    }
  }

  _cancelRequest = (providerId) => {
    Alert.alert('Onayınız gerekmekte!', 'Danışmanlık talebini iptal etmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          onPress: () => { },
          style: 'cancel',
        },
        { text: 'Evet', onPress: () => this._cancelProviderRequest(providerId) },
      ],
      { cancelable: false },
    );
  }

  render() {
    const provider = this.props.provider;
    const { providerId } = provider;
    console.log('provider is =>', provider);
    const content = (
      <View>
        <Text h3 style={{ textAlign: 'center', paddingBottom: 5 }}>{provider.displayName || 'Adı yok'}</Text>
        <RowItem label="Uzmanlık" content={provider.profession} />
        <ColumnItem label="Biyografi" content={provider.experience} />
      </View>
    );
    let info = (
      <Button
        icon={<RequestIcon color='#041256' />}
        type="clear"
        title={`Danışmanlık Talep Et (${provider.generalFee} TRY)`}
        titleStyle={{ color: '#041256' }}
        onPress={() => this._sendProviderRequest(providerId, provider.generalFee ? provider.generalFee : 0)} />
    );
    if (provider.isApproved === true) {
      info = (
        <Button
          disabled
          title="Danışmanlık Alınıyor"
          type="clear"
          icon={<CheckIcon />}
          disabledTitleStyle={{ color: 'green' }} />);
    } else if (provider.isApproved === 'pending') {
      info = (
        <Button
          icon={<RequestIcon color='#041256' />}
          type='clear'
          title='Onay Bekliyor... Talebi İptal Et!'
          titleStyle={{ color: '#041256' }}
          onPress={() => this._cancelRequest(providerId)} />);
    } else if (provider.isApproved === false) {
      info = (<Text style={{ color: 'red', fontWeight: 'bold', alignSelf: 'center' }}>Uzman Reddetti!</Text>);
    } else if (provider.isApproved === 'pause') {
      info = (<Text style={{ color: 'orange', fontWeight: 'bold', alignSelf: 'center' }}>Hizmet durduruldu!</Text>);
    }
    let image = provider.photoURL ? { uri: provider.photoURL } : require('../../assets/images/user.png')
    return (
      <Card
        image={image}
        imageStyle={{ borderRadius: 50 }}
        titleStyle={{ fontSize: 21 }}
        containerStyle={{
          //backgroundColor: '#e9fce9',
          margin: 3,
          borderWidth: 3,
          borderColor: 'black',
          borderRadius: 7,
          marginBottom: 7,
        }}
      >
        {content}
        {info}
        <Text style={{ color: 'red', fontSize: 12 }}>{this.state.errorMessages ? this.state.errorMessages[providerId] : ""}</Text>
      </Card>
    );
  }
}

export default connect(null, actions)(ProviderCard);