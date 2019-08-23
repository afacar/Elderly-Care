import React, { Component } from 'react';
import { StyleSheet, Dimensions, View, FlatList, Alert } from 'react-native';
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
        <Text h3 style={{ textAlign: 'center', paddingBottom: 50 }}>{provider.displayName || 'Adı yok'}</Text>
        <RowItem label="Uzmanlık" content={provider.profession} />
        <RowItem label="Biyografi" content={provider.experience} />
      </View>
    );
    let info = (
      <Button
        icon={<RequestIcon color='#041256' />}
        type="clear"
        title={`Danışmanlık Talep Et (${provider.generalFee ? provider.generalFee : 0} TRY)`}
        titleStyle={{ color: '#041256' }}
        onPress={() => this._sendProviderRequest(providerId, provider.generalFee ? provider.generalFee : 0)} />
    );
    if (provider.isApproved === 'Approve') {
      info = (
        <Button
          disabled
          title="Danışmanlık Alınıyor"
          type="clear"
          icon={<CheckIcon />}
          disabledTitleStyle={{ color: 'green' }} />);
    } else if (provider.isApproved === 'Pending') {
      info = (
        <Button
          icon={<RequestIcon color='#041256' />}
          type='clear'
          title='Onay Bekliyor... Talebi İptal Et!'
          titleStyle={{ color: '#041256' }}
          onPress={() => this._cancelRequest(providerId)} />
      );
    }

    let image = provider.photoURL ? { uri: provider.photoURL } : require('../../assets/images/user.png')
    return (
      <Card
        image={ image }
       // imageStyle={{ flex: 1, width: Math.round(Dimensions.get('window').width) }}
        imageStyle={styles.image }
      //  titleStyle={{ fontSize: 21 }}
        containerStyle={styles.container}
      >
        {content}
        {info}
        <Text style={{ color: 'red', fontSize: 12 }}>{this.state.errorMessages ? this.state.errorMessages[providerId] : ""}</Text>
      </Card>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    margin: 6,
    borderWidth: 4,
    borderColor: 'black',
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#f7f7f7'
  },
  image: {
    height: Math.round(Dimensions.get('window').height)/4, 
    width: Math.round(Dimensions.get('window').width)/3.5 ,
    flex: 1, 
    alignSelf: 'center', 
    justifyContent: 'flex-end',
    borderWidth: 3,
    marginTop: 10


  },
});
export default connect(null, actions)(ProviderCard);