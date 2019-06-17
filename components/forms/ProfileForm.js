import React, { Component } from 'react';
import { View, Picker, Image } from 'react-native';
import { Input, Text, Card, Button } from 'react-native-elements';
import { connect } from 'react-redux';

import * as actions from '../../appstate/actions';
import { CardItem, DatePicker, SaveButton, LogoutButton, ListPicker, NoteInput, PhoneInput, EmailInput, TextInput } from '../common';

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
    try {
      await this.props.save_profile(profile);
      this.setState({ disabled: true })
    } catch (error) {
      this.setState({ error });
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
          profile[key] = newState[key];
        }
      }
      prevState.profile = profile;
      prevState.disabled = false;
      console.log('handleState new prevState', prevState);
      return prevState;
    });
  }

  render() {
    console.log('ProfileForm rendered state,', this.state);
    return (
      <Card title="Bilgileriniz" containerStyle={styles.containerStyle}>
        <Image
          style={{ width: 150, height: 150, alignSelf: 'center', paddingBottom: 25 }}
          source={{ uri: this.state.profile.photoURL }}
        />
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
