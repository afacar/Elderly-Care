import React from 'react';
import { ScrollView, KeyboardAvoidingView, ActivityIndicator, StatusBar } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import * as actions from '../appstate/actions';
import {
  UserProfileForm, ProfileForm
} from '../components/forms';

class UserProfileScreen extends React.Component {

  componentDidMount() { }

  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.getParam('user').name}`,
    headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    });

  render() {
      console.log("User UPS", this.props.navigation.getParam('user'))
    return (
      <ScrollView>
        <KeyboardAvoidingView>
          <UserProfileForm navigation={this.props.navigation} user={this.props.navigation.getParam('user')}/>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

export default connect(null, actions)(UserProfileScreen);
