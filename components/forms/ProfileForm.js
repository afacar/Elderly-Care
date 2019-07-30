import React, { Component } from 'react';
import { View, Picker, Image, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import ImagePicker from 'react-native-image-picker';

import { Input, Text, Card, Button, Icon, Overlay } from 'react-native-elements';
import { connect } from 'react-redux';
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";

import * as actions from '../../appstate/actions';
import {
  CardItem,
  DatePicker,
  SaveButton,
  LogoutButton,
  ListPicker,
  NoteInput,
  PhoneInput,
  EmailInput,
  TextInput,
  NumericInput,
  ErrorLabel
} from '../common';
import Modal from 'react-native-modal';

class _ProfileForm extends Component {

  state = {
    profile: {},
    loading: false,
    error: '',
    disabled: true,
    price: '0',
    priceError: '',
    paymentError: '',
    paymentResult: '',
    isCardVisible: false,
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
    this.setState({ cardError: '', paymentError: {} })
    const { card, price } = this.state;
    if (!card) {
      this.setState({ paymentLoading: false, cardError: 'Kard bilgilerini kontrol edin!' })
      return;
    }
    const { valid, status, values } = card;
    if (!valid) {
      this.setState({ paymentLoading: false, cardError: 'Kard bilgilerini kontrol edin!' })
    } else {
      console.log('doing payment...');
      this.setState({ paymentLoading: true });
      this.props.do_payment(card.values, price)
        .then(paymentResult => {
          this.setState({ paymentResult, paymentLoading: false, price: '0' });
          setTimeout(() => {
            this.setState({ isCardVisible: false });
          }, 2500);
        })
        .catch(paymentError => {
          console.log('paymentError', paymentError)
          this.setState({ paymentError, paymentLoading: false })
        })
      console.log('payment done!');
    }
  }

  _prePayment = () => {
    if (this.state.price <= 0) {
      this.setState({ priceError: 'Miktar 0 TL uzeri olmadilir' })
      return;
    }
    this.setState({ isCardVisible: true })
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

        <Overlay
          backdropOpacity={1}
          isVisible={this.state.isCardVisible}
          onBackButtonPress={() => this.setState({ isCardVisible: false })} >
          <>
            {
              this.state.paymentResult === '' && (<View>
                <CreditCardInput
                  requiresName
                  requiresCVC
                  onChange={this._onCardChange} />
                <ErrorLabel>{this.state.cardError}</ErrorLabel>
                <ErrorLabel>{this.state.paymentError.message}</ErrorLabel>
                <Button disabled={this.state.paymentLoading} title={this.state.paymentLoading ? 'Odeme Sonucu Bekleniyor...' : `${this.state.price} TRY ONAYLA`} onPress={this._confirmPayment} />
              </View>)
            }
            {
              this.state.paymentResult !== '' && (<View style={{ alignSelf: 'center' }}>
                <Icon
                  name='check'
                  type='antdesign'
                  color='green'
                  size={33}
                />
                <Text h4>{'Odeme Basarili!!!'}</Text>
              </View>)
            }
          </>
        </Overlay>

        <CardItem>
          <NumericInput
            label="Cuzdan"
            value={this.state.profile.wallet + ''}
            editable={false}
            style={{ flex: 1 }}
          />
          <Text style={{ flex: 1, fontSize: 21, alignSelf: 'flex-end' }}>TRY</Text>
        </CardItem>
        <CardItem>
          <NumericInput
            label='Tutar'
            style={{ flex: 1 }}
            errorMessage={this.state.priceError}
            value={this.state.price}
            onChangeText={(price) => this.setState({ price, priceError: '' })} />
          <Text style={{ flex: 1, fontSize: 21, alignSelf: 'flex-end' }}>TRY</Text>
          <Button
            buttonStyle={{ flex: 1 }}
            title='Odeme Yap' onPress={this._prePayment}
          />
        </CardItem>

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
