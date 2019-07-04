import React, { Component } from 'react';
import { View, Picker, Image, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-picker';

import { Input, Text, Card, Button } from 'react-native-elements';
import { connect } from 'react-redux';

import * as actions from '../../appstate/actions';
import { CardItem, DatePicker, SaveButton, LogoutButton, ListPicker, NoteInput, PhoneInput, EmailInput, TextInput } from '../common';

class _ProfileForm extends Component {

  state = { profile: {}, loading: false, error: '', disabled: true };
  _isMounted = false;
  
  METHOD_DATA = [{
    supportedMethods: ['android-pay'],
    data: {
      supportedNetworks: ['visa', 'mastercard', 'amex'],
      currencyCode: 'TRY',
      environment: 'TEST', // defaults to production
      paymentMethodTokenizationParameters: {
        tokenizationType: 'GATEWAY_TOKEN',
        parameters: {
          gateway: 'braintree',
          publicKey: 'PUBLIC KEY FROM BRAINTREE',
        }
      }
    }
  }];

  DETAILS = {
    id: 'basic-example',
    displayItems: [
      {
        label: 'Movie Ticket',
        amount: { currency: 'TRY', value: '1.00' }
      }
    ],
    total: {
      label: 'Merchant Name',
      amount: { currency: 'TRY', value: '1.00' }
    }
  };

  paymentRequest = new PaymentRequest(this.METHOD_DATA, this.DETAILS);

  openPay = () => {
    this.paymentRequest.show()
      .then(paymentResponse => {
        // Your payment processing code goes here
        console.log('paymentResponse', paymentResponse);
        //return processPayment(paymentResponse);
      })
      .catch(err => {
        this.paymentRequest.abort();
        console.log('Payment Error:', err);
      });
  }

  _fetchProfile = async () => {
    try {
      this.props.fetch_profile((profile) => {
        this._isMounted && this.setState({ profile });
      });
    } catch (error) {
      this.setState({ error });
    }
  }

  _saveProfile = async () => {
    const { profile } = this.state;
    this.setState({
      loading: true
    })
    try {
      await this.props.save_profile(profile);
      this.setState({ disabled: true, loading: false })
    } catch (error) {
      this.setState({ error, loading: false });
    }
  };

  _logoutUser = () => {
    this.props.logout();
    this.props.navigation.navigate('Auth');
  }

  handleState = (newState) => {
    this.setState(prevState => {
      console.log('handleState prevState and newState', prevState, newState);
      let profile = prevState.profile;
      for (var key in newState) {
        if (newState.hasOwnProperty(key)) {
          if (key === "response") {
            profile.photoURL = newState.response.uri;
            profile.path = newState.response.path;
            profile.newPhoto = true;
          } else {
            profile[key] = newState[key];
          }
        }
        prevState.profile = profile;
        prevState.disabled = false;
        console.log('handleState new prevState', prevState);
        return prevState;
      }
    });
  }

  onImageClicked = () => {
    this.openPicker();
  }

  openPicker = () => {

    // More info on all the options is below in the API Reference... just some common use cases shown here
    const options = {
      title: 'Fotoğraf Seç',
      storageOptions: {
        skipBackup: true,
        path: 'images',
        allowsEditing: true,
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        this.handleState({ response });
      }
    });
  }

  render() {
    console.log('ProfileForm rendered state,', this.state);
    return (
      <Card title="Bilgileriniz" containerStyle={styles.containerStyle}>
        <TouchableOpacity
          onPress={this.onImageClicked}>
          <View>
            <Image
              style={{ width: 150, height: 150, alignSelf: 'center', paddingBottom: 25 }}
              source={{ uri: this.state.profile.photoURL }}
            />
          </View>
        </TouchableOpacity>

        <Button title='Kredi al' onPress={this.openPay} />

        <CardItem>
          <TextInput
            label="Ad soyad"
            value={this.state.profile.displayName}
            placeholder="Ör. Ahmet Yılmaz"
            onChangeText={displayName => this.handleState({ displayName })}
          />
        </CardItem>
        <CardItem>
          <EmailInput
            value={this.state.profile.email}
            onChangeText={email => this.handleState({ email })}
          />
        </CardItem>
        <CardItem>
          <PhoneInput
            value={this.state.profile.phoneNumber}
            onChangeText={phoneNumber => this.handleState({ phoneNumber })}
          />
        </CardItem>
        <CardItem>
          <DatePicker
            key="profilebirthdate"
            label="Doğum Tarihi"
            containerStyle={{ flexDirection: 'row' }}
            textContainerStyle={{ borderBottomWidth: 1 }}
            selectedDate={this.state.profile.birthdate}
            onDateChange={(birthdate) => this.handleState({ birthdate })}
          />
        </CardItem>
        <CardItem>
          <ListPicker
            label='Cinsiyet'
            selectedValue={this.state.profile.gender}
            onValueChange={(gender, itemIndex) => this.handleState({ gender })}
            options={['Erkek', 'Kadın']}
          />
        </CardItem>
        <CardItem>
          <NoteInput
            label='Adres'
            value={this.state.profile.address}
            placeholder="Adres..."
            onChangeText={address => this.handleState({ address })}
          />
        </CardItem>
        <SaveButton
          title={this.state.loading ? "Kaydediliyor..." : ""}
          disabled={this.state.disabled}
          onPress={this._saveProfile}
        />
        <LogoutButton
          onPress={this._logoutUser}
          title="Çıkış yap"
        />
      </Card>
    );
  }

  async componentDidMount() {
    this._isMounted = true;
    this._fetchProfile();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

}

const styles = {
  containerStyle: {
    margin: 5,
  }
}

const ProfileForm = connect(null, actions)(_ProfileForm);

export { ProfileForm };
