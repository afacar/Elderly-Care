import React, { Component } from 'react';
import { ScrollView, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';

import ProviderProfileForm from "../components/forms/ProviderProfileForm";
import * as actions from '../appstate/actions';

class ProviderProfileScreen extends Component {
  static navigationOptions = {
    title: 'Profil Ayarları',
  };

  render() {
    return (
      <ScrollView>
        <KeyboardAvoidingView>
          <ProviderProfileForm
            navigate={this.props.navigation.navigate}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }

}

export default connect(null, actions)(ProviderProfileScreen);