import React from 'react';
import { ScrollView, KeyboardAvoidingView, ActivityIndicator, StatusBar } from 'react-native';
import _ from 'lodash';
import { Text } from 'react-native-elements';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import * as actions from '../appstate/actions';
import {
  ProfileForm
} from '../components/forms';

class SettingsScreen extends React.Component {

  componentDidMount() { }

  static navigationOptions = {
    header: null,
  };

  render() {
    return (
      <ScrollView>
        <KeyboardAvoidingView>
          <ProfileForm navigation={this.props.navigation} />
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

export default connect(null, actions)(SettingsScreen);
