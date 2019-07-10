import React, { Component } from 'react';
import { View, Picker, Image, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-picker';

import { Input, Text, Card, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";

import * as actions from '../../appstate/actions';
import { CardItem, DatePicker, SaveButton, LogoutButton, ListPicker, NoteInput, PhoneInput, EmailInput, TextInput } from '../common';
import Modal from 'react-native-modal';

class _ProfileForm extends Component {

  state = { profile: {}, loading: false, error: '', disabled: true };
  _isMounted = false;

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

  _onCardChange = (card) => this.setState({ card });


  // buyer: {
  //     id: 'BY789',
  //     name: 'John',
  //     surname: 'Doe',
  //     gsmNumber: '+905350000000',
  //     email: 'email@email.com',
  //     identityNumber: '74300864791',
  //     lastLoginDate: '2015-10-05 12:43:35',
  //     registrationDate: '2013-04-21 15:12:09',
  //     registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
  //     ip: '85.34.78.112',
  //     city: 'Istanbul',
  //     country: 'Turkey',
  //     zipCode: '34732'
  // },
  // shippingAddress: {
  //     contactName: 'Jane Doe',
  //     city: 'Istanbul',
  //     country: 'Turkey',
  //     address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
  //     zipCode: '34742'
  // },
  // billingAddress: {
  //     contactName: 'Jane Doe',
  //     city: 'Istanbul',
  //     country: 'Turkey',
  //     address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
  //     zipCode: '34742'
  // },
  // basketItems: [
  //     {
  //         id: 'BI101',
  //         name: 'Binocular',
  //         category1: 'Collectibles',
  //         category2: 'Accessories',
  //         itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
  //         price
  //     }
  // ]

  _confirmPayment = async () => {
    this.setState({ cardError: '' })
    const { card } = this.state;
    const { valid, status, values } = card;
    if (valid) {
      console.log('doing payment...');
      await this.props.do_payment(this.state.card.values);
      console.log('payment done!');
    } else {
      this.setState({ cardError: 'Kard bilgilerini kontrol edin!' })
    }
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

        <Modal backdropOpacity={0.9} backdropColor='white' isVisible={this.state.isCardVisible} onBackButtonPress={() => this.setState({ isCardVisible: false })}>
          <CreditCardInput
            requiresName
            requiresCVC
            onChange={this._onCardChange} />
          <Text>{this.state.cardError}</Text>
          <Button title='Onayla' onPress={this._confirmPayment} />
        </Modal>
        <Button title='Odeme Yap' onPress={() => this.setState({ isCardVisible: true })} />

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
