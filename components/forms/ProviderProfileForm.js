import React, { Component } from 'react';
import { View, Picker, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import ImagePicker from 'react-native-image-picker';

import { Input, Text, Card, Button } from 'react-native-elements';
import { connect } from 'react-redux';

import * as actions from '../../appstate/actions';
import { CardItem, DatePicker, SaveButton, LogoutButton, ListPicker, NoteInput, PhoneInput, EmailInput, TextInput } from '../common';

class ProviderProfileForm extends Component {

  state = { profile: { newPhoto: false }, loading: false, error: '', disabled: true };

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
    console.log("Profile details", profile);
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

  _logoutUser = async () => {
    try {
      await this.props.logout();
    } catch (error) {
      console.log('Provider logout hatası:', error.message);
    }
    this.props.navigate('Auth');
  }

  handleState = (newState) => {
    this.setState(prevState => {
      console.log('handleState prevState and newState', prevState, newState);
      let profile = prevState.profile;
      for (var key in newState) {
        if (newState.hasOwnProperty(key)) {
          if (key === "response") {
            console.log("We got new photo");
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

        <View>
          <ImageBackground
            style={{ height: Math.round(Dimensions.get('window').height)/4, 
            width: Math.round(Dimensions.get('window').width)/2.75 , alignSelf: 'center', justifyContent: 'flex-end' }}
            //style={{ width: 150, height: 150, alignSelf: 'center', paddingBottom: 25 }}
            source={this.state.profile.photoURL ? { uri: this.state.profile.photoURL } : require("../../assets/images/doctor.png")}
          >
            <Button
              icon={{
                name: "camera",
                size: 20,
                color: "white"
              }}
              title=""
              type='clear'
              titleStyle={{ color: 'white' }}
              buttonStyle={{ backgroundColor: 'rgba(52, 52, 52, 0.5)' }}
              onPress={this.onImageClicked}
            />
          </ImageBackground>
        </View>

        <CardItem>
          <TextInput
            key="displayname"
            label="Ad soyad"
            value={this.state.profile.displayName}
            placeholder="Ör. Ahmet Yılmaz"
            onChangeText={displayName => this.handleState({ displayName })}
          />
        </CardItem>
        <CardItem>
          <TextInput
            key='profession'
            label='Uzmanlık'
            placeholder='Ör. Nörolog, Psikolog, Sosyal Hizmetler Uzmanı'
            value={this.state.profile.profession}
            onChangeText={profession => this.handleState({ profession })}
            errorMessage={this.state.professionError}
            ref={ref => this.profession = ref}
            must={true}
          />
        </CardItem>
        <CardItem>
          <NoteInput
            key='biography'
            label='Biyografi'
            placeholder='Ör. 7 (Yıl) Tecrübe'
            value={this.state.profile.experience}
            onChangeText={experience => this.handleState({ experience })}
            errorMessage={this.state.experienceError}
            ref={ref => this.experience = ref}
            must={true}
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

export default connect(null, actions)(ProviderProfileForm)