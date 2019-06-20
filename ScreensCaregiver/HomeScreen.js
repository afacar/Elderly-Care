import React from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  View
} from 'react-native';
import firebase from 'react-native-firebase';
import { Overlay } from 'react-native-elements';
import { connect } from 'react-redux';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-navigation';

import Agenda from '../components/views/Agenda';
import * as actions from '../appstate/actions';
import ReminderForm from '../components/forms/ReminderForm';
import MeasurementForm from '../components/forms/MeasurementForm';


class HomeScreen extends React.Component {
  static navigationOptions = { header: null };

  state = {
    isReminderVisible: false,
    isMeasurementVisible: false,
    selectedReminder: {},
    selectedMeasurement: {},
  };

  _closeModal = () => this.setState({ isMeasurementVisible: false, isReminderVisible: false })

  _openModal = (item = '', type = '') => {
    if (type == 'reminder') {
      this.setState({ isReminderVisible: true, selectedReminder: item });
    } else if (type == 'measurement') {
      this.setState({ isMeasurementVisible: true, selectedMeasurement: item });
    }
  }

  render() {
    return (
      <View style={styles.container} >
        <KeyboardAvoidingView style={{ flex: 1 }} >
          <Agenda
            style={{ flex: 1,  }}
            openModal={this._openModal}
          />
          <ActionButton buttonColor="rgba(231,76,60,1)">
            <ActionButton.Item
              buttonColor='#9b59b6'
              title="Yeni hatırlatma"
              onPress={() => this._openModal('', 'reminder')}
            >
              <Icon name="md-notifications" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item
              buttonColor='#3498db'
              title="Yeni ölçüm"
              onPress={() => this._openModal('', 'measurement')}
            >
              <Icon name="md-thermometer" style={styles.actionButtonIcon} />
            </ActionButton.Item>
          </ActionButton>

          <Overlay
            fullScreen
            style={{ flex: 1 }}
            transparent={true}
            isVisible={this.state.isReminderVisible}
            onRequestClose={() => this._closeModal()}
          >
            <ReminderForm
              reminder={this.state.selectedReminder}
              openModal={this._openModal}
              closeModal={this._closeModal}
            />
          </Overlay>

          <Overlay
            fullScreen
            transparent={false}
            isVisible={this.state.isMeasurementVisible}
            onRequestClose={() => this._closeModal()}
          >
            <MeasurementForm
              measurement={this.state.selectedMeasurement}
              openModal={this._openModal}
              closeModal={this._closeModal}
            />
          </Overlay>
        </KeyboardAvoidingView>
      </View>
    );
  }

  componentWillUnmount() {
    // NOTE: This unsubscribe is important to free onAuthStateChanged attachment
    // Otherwise Provider cannot navigate to ProviderHomeScreen but 'Main' screen
    if (this.unsubscribe) this.unsubscribe();
  }

  async componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      console.log("HomeScreen._bootstrapAsync() Loggedin as user -> ", user);
      if (!user) this.props.navigation.navigate('Auth');
    });
  }

}

const styles = StyleSheet.create({
  container: {
   flex: 1
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  modal: {
    height: 100,
  }
});

function mapStateToProps({ auth }) {
  return { user: auth.user };
}

export default connect(mapStateToProps, actions)(HomeScreen);