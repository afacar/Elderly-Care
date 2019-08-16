import React, { Component } from 'react';
import { View, Picker, Image, TouchableOpacity, Platform, ImageBackground, WebView, ActivityIndicator } from 'react-native';
import ImagePicker from 'react-native-image-picker';

import { Input, Text, Card, Button, Icon, Overlay } from 'react-native-elements';
import { connect } from 'react-redux';
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";
import * as actions from '../../appstate/actions';
import IyziPaymentErrors from '../../constants/Errors'
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
  ErrorLabel,
  ColumnItem
} from '../common';
import Base64 from '../common/Base64';
import firebase from 'react-native-firebase';

const timeout = 5000;
class _ProfileForm extends Component {
  state = {
    conversationId: '',
    profile: {},
    loading: false,
    error: '',
    disabled: true,
    price: 0,
    priceError: '',
    paymentError: '',
    paymentResult: null,
    isCardVisible: false,
    isPaying: false,
    isPriceSet: false,
    showFinalResult: false,
    paymentSuccesfull: false,
    threedsPaymentLoading: false,
    threedsCodeText: ''
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
      var conversationId = await firebase.auth().currentUser.uid + "_" + (new Date().getTime());
      this.setState({ paymentLoading: true, conversationId, threedsPaymentLoading: true });
      this.props.start_payment(card.values, conversationId, price)
        .then(paymentResult => {
          console.log("Base 64", Base64.atob(paymentResult.data.htmlContent));
          this.setState({ paymentResult, paymentLoading: false, threedsPaymentLoading: false, showthreeds: true });
        })
        .catch((paymentError) => {
          console.log('paymentError', paymentError)
          this.setState({ paymentErrorMessage: paymentError[Error], paymentLoading: false, threedsPaymentLoading: false, showFinalResult: true, paymentResult: false })
          setTimeout(this.resetState, timeout);
        })
      console.log('payment done!');
    }
  }

  _prePayment = () => {
    if (parseInt(this.state.price) <= 0) {
      this.setState({ priceError: 'Miktar 0 TL uzeri olmalıdır' })
      return;
    }
    this.setState({ isPaying: true, isPriceSet: true });
  }

  showthreedsCodeText = () => {
    if (this._isMounted) {
      this.setState({
        threedsPaymentLoading: true,
        threedsCodeText: 'Numaranıza gelen kodu girin!'
      })
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

        <Overlay
          //backdropOpacity={1}
          isVisible={this.state.isCardVisible}
          containerStyle={{ marginHorizontal: 1 }}
          animationType='slide'
          onBackdropPress={() => this.setState({ isCardVisible: false, paymentResult: '', isPriceSet: false })} >
          <>
            {
              !this.state.isPriceSet && (
                <View style={{ borderWidth: 1, flex: 1, justifyContent: 'center' }}>
                  <CardItem style={{ alignitems: 'center', justifyContent: 'center' }}>
                    <NumericInput
                      //onFocus={() => this.setState({ price: '' })}
                      label='Yuklemek Istediginiz Tutar'
                      style={{ flex: 1, marginHorizontal: 15 }}
                      rightIcon={{
                        type: 'material-community',
                        name: 'currency-try',
                        size: 21
                      }}
                      errorMessage={this.state.priceError}
                      value={this.state.price}
                      onChangeText={(price) => this.setState({ price, priceError: '' })} />
                  </CardItem>
                  <View style={{ flexDirection: 'column' }}>
                    <Button
                      type='clear'
                      icon={{
                        name: "cancel",
                        type: 'material',
                        size: 21,
                        color: 'red'
                      }}
                      //containerStyle={{ flex: 1 }}
                      title='Iptal'
                      onPress={() => this.setState({ isCardVisible: false, paymentResult: '', isPriceSet: false })}
                    />
                    <Button
                      type='clear'
                      icon={{
                        name: "credit-card",
                        type: 'material',
                        size: 21,
                      }}
                      //containerStyle={{ flex: 2 }}
                      title='Kard Bilgilerini Giriniz'
                      onPress={this._prePayment}
                    />
                  </View>
                  <CardItem>
                    <NumericInput
                      label='Tutar'
                      style={{ flex: 1 }}
                      errorMessage={this.state.priceError}
                      value={this.state.price + ''}
                      onChangeText={(price) => this.setState({ price, priceError: '' })} />
                    <Text style={{ flex: 1, fontSize: 21, alignSelf: 'flex-end' }}>TRY</Text>
                    <Button
                      buttonStyle={{ flex: 1 }}
                      title='Odeme Yap' onPress={this._prePayment}
                    />
                  </CardItem>
                </View>
              )
            }
            {
              (this.state.isPriceSet && this.state.paymentResult === '') && (
                <View style={{ borderWidth: 1, justifyContent: 'center' }}>
                  <CreditCardInput
                    requiresName
                    requiresCVC
                    onChange={this._onCardChange} />
                  <ErrorLabel>{this.state.cardError}</ErrorLabel>
                  <ErrorLabel>{this.state.paymentError.message == "INTERNAL" ? "Internet bağlantısı hatası oluştu" : this.state.paymentError.message}</ErrorLabel>
                  <Button
                    type='outline'
                    disabled={this.state.paymentLoading}
                    title={this.state.paymentLoading ? 'Odeme Sonucu Bekleniyor...' : `${parseInt(this.state.price)} TRY ONAYLA`} onPress={this._confirmPayment} />
                </View>
              )
            }
            {
              (this.state.isPriceSet && this.state.paymentResult !== '' && this.state.showthreeds) && (
                <View style={{ alignSelf: 'center' }}>
                  <WebView
                    onLoad={this.showthreedsCodeText}
                    source={{ html: Base64.atob(this.state.paymentResult.data.htmlContent) }}
                    onTouchCancel={this.resetState} />
                  <ActivityIndicator animating={this.state.threedsPaymentLoading} size='large' color='#5FC9F8' style={{ alignSelf: 'center' }} />
                  <Text h4 style={{ alignSelf: 'center', textAlign: 'center', color: 'black' }}>{this.state.threedsCodeText ? this.state.threedsCodeText : 'Sunucu yanıtı bekleniyor'}</Text>
                </View>
              )
            }
            {
              (this.state.isPriceSet && this.state.paymentResult !== '' && this.state.showFinalResult) && (
                <View style={{ alignSelf: 'center', alignContent: 'center' }}>
                  <Icon
                    name={this.state.paymentSuccesfull == true ? 'check' : 'close'}
                    type='antdesign'
                    color={this.state.paymentSuccesfull == true ? 'green' : 'red'}
                    size={33}
                  />
                  <Text h4>{this.state.paymentSuccesfull == true ? "Ödeme Başarılı" : "Hata oluştu"} </Text>
                  <Text h4>{this.state.paymentErrorMessage ? this.state.paymentErrorMessage : ""}</Text>
                </View>
              )
            }
          </>
        </Overlay>

        <CardItem>
          <NumericInput
            label="Cuzdan"
            value={parseInt(this.state.profile.wallet) + ''}
            editable={false}
            style={{ flex: 1 }}
          />
          <Text style={{ flex: 1, fontSize: 21, alignSelf: 'flex-end' }}>TRY</Text>
          <Button
            buttonStyle={{ flex: 1 }}
            type='outline'
            title='Kredi Al' onPress={() => this.setState({ isCardVisible: true, paymentResult: '' })}
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

  resetState = () => {
    if (this._isMounted) {
      this.setState({
        conversationId: '',
        loading: false,
        error: '',
        price: 0,
        priceError: '',
        paymentError: '',
        paymentResult: null,
        isCardVisible: false,
        isPaying: false,
        isPriceSet: false,
        showFinalResult: false,
        threedsCodeText: '',
        threedsPaymentLoading: false
      })
    }
  }

  componentDidMount() {
    this._isMounted = true;
    this.props.checkNewPayment(newPayment => {
      console.log("New Payment", newPayment);
      var result = newPayment.result
      console.log("New Payment Result", result);
      if (result) {
        if (result.conversationId == this.state.conversationId) {
          if (result.status === 'success' && result.mdStatus == 1) {
            console.log("Here");
            var paymentObject = {
              conversationId: result.conversationId,
              paymentId: result.paymentId,
              conversationData: result.conversationData
            }
            this.setState({
              threedsPaymentLoading: true,
              threedsCodeText: 'Ödeme alınıyor'
            })
            this.props.finalize_payment(paymentObject)
              .then((paymentResult) => {
                console.log("finalize payment no error")
                this.setState({
                  profile: { ...this.state.profile, wallet: parseInt(this.state.profile.wallet) + parseInt(this.state.price) },
                  showFinalResult: true,
                  showthreeds: false,
                  paymentSuccesfull: true,
                  threedsPaymentLoading: false,
                })
                setTimeout(this.resetState, timeout)
              })
              .catch((paymentError) => {
                console.log("finalize payment error", paymentError)
                this.setState({
                  showFinalResult: true,
                  showthreeds: false,
                  paymentErrorMessage: paymentError,
                  paymentSuccesfull: false
                })
                setTimeout(this.resetState, timeout)
              });

          } else {
            console.log("Here1");
            const mdStatus = result.mdStatus;
            var errorMessage = IyziPaymentErrors.IyziPaymentErrors[mdStatus];
            this.setState({
              showFinalResult: true,
              showthreeds: false,
              paymentErrorMessage: errorMessage,
              paymentSuccesfull: false
            })
            setTimeout(this.resetState, timeout)
          }
        }
      }
    })
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
