import React, { Component } from 'react';
import { View, Picker, Image, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import ImagePicker from 'react-native-image-picker';

import Icon from 'react-native-vector-icons/FontAwesome';


import { Input, Text, Card, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";

import * as actions from '../../appstate/actions';
import { CardItem, DatePicker, SaveButton, LogoutButton, ListPicker, NoteInput, PhoneInput, EmailInput, TextInput, NumericInput } from '../common';
import Modal from 'react-native-modal';

class _ProfileForm extends Component {

  state = {
    profile: {},
    loading: false,
    error: '',
    disabled: true,
    price: '0',
  };

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


        if (Platform.OS === 'ios') {
          response.path = response.uri.replace("file://", '');
        }

        this.handleState({ response });


      }
    });
  }

  _onCardChange = (card) => this.setState({ card });

  _confirmPayment = async () => {
    this.setState({ cardError: '' })
    const { card, price } = this.state;
    const { valid, status, values } = card;
    if (valid) {
      console.log('doing payment...');
      await this.props.do_payment(card.values, price);
      console.log('payment done!');
    } else {
      this.setState({ cardError: 'Kard bilgilerini kontrol edin!' })
    }
  }

  render() {
    console.log('ProfileForm rendered state,', this.state);
    return (
      <Card title="Bilgileriniz" containerStyle={styles.containerStyle}>
        <View style={{ paddingBottom: 25 }}>
          <ImageBackground style={{ width: 150, height: 150, alignSelf: 'center', justifyContent: 'flex-end' }}
            //imageStyle={{ borderRadius:75 }}
            source={{ uri: this.state.profile.photoURL }}
          >
            <Button
              icon={{
                name: "camera",
                size: 20,
                color: "white"
              }}
              title="Change"
              type='clear'
              titleStyle={{ color: 'white' }}
              buttonStyle={{ backgroundColor: 'rgba(52, 52, 52, 0.5)' }}
              onPress={this.onImageClicked}
            />

          </ImageBackground>
        </View>


        <Modal backdropOpacity={0.9} backdropColor='white' isVisible={this.state.isCardVisible} onBackButtonPress={() => this.setState({ isCardVisible: false })}>
          <CreditCardInput
            requiresName
            requiresCVC
            onChange={this._onCardChange} />
          <Text>{this.state.cardError}</Text>
          <Button title='Onayla' onPress={this._confirmPayment} />
        </Modal>
        <NumericInput label='Tutar' value={this.state.price} onChangeText={(price) => this.setState({ price })} />
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
