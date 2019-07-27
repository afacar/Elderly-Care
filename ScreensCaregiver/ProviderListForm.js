import React, { Component } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-elements';
import { connect } from 'react-redux';

import { RowItem, ColumnItem } from "../components/common/Items";
import * as actions from '../appstate/actions';
import { CheckIcon, RequestIcon } from '../components/common/Icons';

class ProviderList extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Uzman Listesi`,
    headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    headerStyle: {
      backgroundColor: 'white',
    },
    headerForceInset: { vercical: 'never' },
  });

  state = { /** List of provider data */
    providers: {}, // { providerId: {profile} }
    errorMessages:{}
  }

  _isMounted = null;

  _renderEmptyItem = () => {
    return (
      <Text>Kayıtlı uzman bulunamadı!</Text>
    );
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

  _renderItem = ({ item }) => {
    const providerId = item;
    const provider = this.state.providers[providerId];
    const content = (
      <View>
        <RowItem label="Uzmanlık" content={provider.profession} />
        <ColumnItem label="Biyografi" content={provider.experience} />
        <RowItem label="Ücret" content={provider.generalFee ? provider.generalFee : "0"} />
      </View>
    );
    let info = (
      <Button
        icon={<RequestIcon color='#041256' />}
        type="clear"
        title='Danışmanlık Talep Et'
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
    return (
      <Card
        title={provider.displayName || 'Adı yok'}
        titleStyle={{ fontSize: 21 }}
        containerStyle={{ margin: 3 }}
      >
        {content}
        {info}
        <Text style={{ color: 'red', fontSize: 12 }}>{this.state.errorMessages ? this.state.errorMessages[providerId] : ""}</Text>
      </Card>
    );
  }

  render() {

    return (
      <View>
        <FlatList
          data={Object.keys(this.state.providers)}
          renderItem={this._renderItem}
          ListEmptyComponent={this._renderEmptyItem}
          keyExtractor={(item) => item}
        />
      </View>
    );
  }

  fetchProviders = async () => {
    try {
      await this.props.fetch_providers((profile) => {
        this._isMounted && this.setState(previousState => {
          const { providerId } = profile;
          const { providers } = previousState;

          //if (!providers[providerId]) providers[providerId] = {};
          providers[providerId] = profile;
          console.log('!Returning new state ', providers);
          return { providers };
        });
      });
    } catch (error) {
      console.error('ProviderList didMount has error:', error.message);
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    this.fetchProviders();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default connect(null, actions)(ProviderList);