import React, { Component } from 'react';
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Input, Card } from "react-native-elements";

import * as actions from "../../appstate/actions";
import { SaveButton, LogoutButton, TextInput, NoteInput } from '../common';

class ProviderProfileForm extends Component {
  state = {
    disabled: true,
    profile: {
      displayName: '',
      profession: '',
      experience: '',
    },
    nameError: '',
    professionError: '',
    experienceError: '',

    saveButtonTitle: 'Kaydedildi',
  };

  handleProfileState = (newState) => {
    this.setState(previousState => {
      let profile = previousState.profile;
      for (var key in newState) {
        if (newState.hasOwnProperty(key)) {
          profile[key] = newState[key];
        }
      }
      previousState.profile = profile;
      previousState.disabled = false;
      return previousState;
    })
  }

  render() {
    return (
      <Card
        containerStyle={styles.containerStyle}
        title='Profil Bilgileriniz'
        image={this.state.photoURL || require('../../assets/images/doctor.png')}
        imageStyle={{ width: 90, height: 90, borderRadius: 100, alignSelf: 'center' }}
      >
        <TextInput
          key='displayname'
          label='Ad soyad'
          placeholder='Ör. Ahmet Yılmaz'
          value={this.state.profile.displayName}
          onChangeText={displayName => this.handleProfileState({ displayName })}
          errorMessage={this.state.nameError}
          ref={ref => this.displayName = ref}
          must={true}
        />
        <TextInput
          key='profession'
          label='Uzmanlık'
          placeholder='Ör. Nörolog, Psikolog, Sosyal Hizmetler Uzmanı'
          value={this.state.profile.profession}
          onChangeText={profession => this.handleProfileState({ profession })}
          errorMessage={this.state.professionError}
          ref={ref => this.profession = ref}
          must={true}
        />
        <NoteInput
          key='biography'
          label='Biyografi'
          placeholder='Ör. 7 (Yıl) Tecrübe'
          value={this.state.profile.experience}
          onChangeText={experience => this.handleProfileState({ experience })}
          errorMessage={this.state.experienceError}
          ref={ref => this.experience = ref}
          must={true}
        />
        <SaveButton
          title='Kaydet'
          onPress={this._saveProfile}
          disabled={this.state.disabled}
        />
        <LogoutButton
          onPress={this._logoutUser}
        />
      </Card>
    );
  }

  _saveProfile = async () => {
    const { profile } = this.state;

    await this.setState({
      nameError: '',
      professionError: '',
      experienceError: '',
      profile: {
        displayName: profile.displayName.trim(),
        profession: profile.profession.trim(),
        experience: profile.experience.trim()
      }
    });

    if (!this.displayName.isValid()) {
      this.setState({ nameError: 'Bu alan boş bırakılamaz' })
      return;
    } 
    if (!this.profession.isValid()) {
      this.setState({ professionError: 'Bu alan boş bırakılamaz' })
      return;
    } 
    if (!this.experience.isValid()) {
      this.setState({ experienceError: 'Bu alan boş bırakılamaz' })
      return;
    } 

    try {
      await this.props.save_profile(this.state.profile);
      this.setState({ disabled: true });
    } catch (error) {
      console.error('Uzman profil kaydederken hata:', error.message);
    }
  }

  _logoutUser = async () => {
    try {
      await this.props.logout();
    } catch (error) {
      console.log('Provider logout hatası:', error.message);
    }
    this.props.navigate('Auth');
  }

  async componentDidMount() {
    await this._bootstrapProfile();
    console.log('ProviderProfileDidMount state', this.state);
  }

  _bootstrapProfile = async () => {
    try {
      await this.props.fetch_profile((profile) => {
        this.setState({ profile });
      });
    } catch (error) {
      console.log('Could not fetch profile data', error.message);
    }
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    margin: 5,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  buttonStyle: {
    marginTop: 15,
    borderRadius: 20,
    backgroundColor: '#096887',
  }
});

export default connect(null, actions)(ProviderProfileForm)