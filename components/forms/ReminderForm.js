import React, { Component } from 'react';
import { Card, Text, ButtonGroup, Input, Button, Icon } from 'react-native-elements';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrollView, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { save_reminder, delete_reminder } from '../../appstate/actions';
import {
  CardItem,
  DatePicker,
  TimePicker,
  SaveButton,
  CancelButton,
  DeleteButton
} from '../common';
import withSpeech from '../common/withSpeech';

import { REMINDER_TYPES, REMINDER_TYPES_PLACEHOLDERS, REPEAT_TYPES } from '../../constants/Options';


class ReminderForm extends Component {

  INITIAL_STATE = {
    /** Meta-data */
    listeningKey: '',
    lastSpeechText: '',
    lastSpeechError: '',
    /** Reminder Data */
    reminderType: 0,
    title: '',
    repeat: 0,
    /** Error messages */
    titleError: '',
    dateError: '',
    /** Loading state */
    saveLoading: false,
    deleteLoading: false,
  };

  state = this.INITIAL_STATE;

  _reminderTypeButtons = REMINDER_TYPES.TR;

  _placeholders = REMINDER_TYPES_PLACEHOLDERS;

  _repeatButtons = REPEAT_TYPES;

  _isMounted = false;

  handleSpeechInput = (listeningKey) => {
    this.setState({ listeningKey, [listeningKey + 'Error']: 'Dinliyorum...' });
    this.props.startListening(listeningKey);
  }

  render() {
    return (
      <ScrollView style={{ flex: 1 }}  keyboardShouldPersistTaps="handled">
        <Text h3 style={{ textAlign: 'center' }}>Hatırlatma Ekle</Text>
        <CardItem>
          <Text style={{ fontSize: 18, paddingLeft: 10, fontWeight: 'bold', color: '#3e464e' }}>Türü </Text>
        </CardItem>
        <CardItem>
          <ButtonGroup
            onPress={(reminderType) => this.setState({ reminderType, reminderName: this.reminderNames[reminderType] })}
            selectedIndex={this.state.reminderType}
            buttons={this._reminderTypeButtons}
            buttonStyle={{ borderBottomWidth: 2, borderRadius: 25 }}
            containerStyle={{ flex: 1, borderWidth: 0 }}
            selectedButtonStyle={{ borderBottomWidth: 0, backgroundColor: '#93cbbd' }}
            innerBorderStyle={{ width: 0 }}
            textStyle={{ fontWeight: "bold", fontSize: 17 }}
          />
        </CardItem>
        <CardItem>
          <Input
            label="Başlık"
            labelStyle={{ marginLeft: 0, paddingLeft: 0, fontSize: 18, paddingLeft: 10, fontWeight: 'bold', color: '#3e464e' }}
            value={this.state.title}
            placeholder={this._placeholders[this.state.reminderType]}
            leftIcon={
              <Icon
                type='material-community'
                name='reminder'
                size={24}
              />
            }
            rightIcon={{
              type: 'entypo',
              name: 'mic',
              size: 30,
              color: (this.state.listeningKey == 'title') ? 'red' : 'black',
              onPress: () => this.handleSpeechInput('title')
            }}
            onChangeText={(title) => this.setState({ title, titleError: '' })}
            inputStyle={{ fontSize: 17 }}
            errorMessage={this.state.titleError}
            errorStyle={{ fontSize: 15, fontWeight: 'bold' }}
            ref={ref => this.titleInput = ref}
          />
        </CardItem>
        <View style={{ flex: 1, flexDirection: 'column', marginTop: 15, marginRight: 10 }}>
          <Text style={{ fontSize: 18, paddingLeft: 10, fontWeight: 'bold', color: '#3e464e' }}>Tarih ve Saat</Text>
          <CardItem>
            <DatePicker
              selectedDate={this.state.selectedDate}
              onDateChange={(selectedDate) => this.setState({ selectedDate, dateError: '' })}
            />
            <TimePicker
              selectedTime={this.state.selectedTime}
              onTimeChange={(selectedTime) => this.setState({ selectedTime })}
            />
            <Icon
              containerStyle={{ alignSelf: 'flex-end' }}
              type='entypo'
              name='mic'
              size={30}
              color={(this.state.listeningKey == 'date') ? 'red' : 'black'}
              onPress={() => this.handleSpeechInput("date")}
            />
          </CardItem>
          <Text style={{ marginLeft: 10, color: 'red', fontSize: 17, fontWeight: 'bold' }}>{this.state.dateError}</Text>
        </View>
        <CardItem>
          <Text style={{ fontSize: 18, paddingLeft: 10, fontWeight: 'bold', color: '#3e464e' }}>Hatırlatma</Text>
        </CardItem>
        <CardItem>
          <ButtonGroup
            onPress={(repeat) => this.setState({ repeat })}
            selectedIndex={this.state.repeat}
            buttons={REPEAT_TYPES.TR}
            buttonStyle={{ borderBottomWidth: 1, borderRadius: 25 }}
            containerStyle={{ flex: 1, borderWidth: 0 }}
            selectedButtonStyle={{ borderBottomWidth: 0, backgroundColor: '#aa6f73' }}
            innerBorderStyle={{ width: 0 }}
            textStyle={{ fontWeight: "bold", fontSize: 15 }}
          />
        </CardItem>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 15 }} >
          <CancelButton
            onPress={this._cancel}
          />
          {this._renderDeleteButton()}
          <SaveButton
            onPress={this._save}
            loading={this.state.saveLoading}
          />
        </View>
      </ScrollView>
    );
  }

  _renderDeleteButton = () => {
    if (this.state.key) {
      return (
        <DeleteButton
          onPress={this._deleteWithConfirm}
          loading={this.state.deleteLoading}
        />
      );
    }
  }

  _save = async () => {
    if (!this.state.title) {
      this.titleInput.shake();
      this.setState({ titleError: "Lütfen hatırlatma başlığı girin!" });
      return;
    }
    this.setState({ saveLoading: true });
    const reminderName = this.reminderNames[this.state.reminderType];
    try {
      this.props.closeModal();
      await this.props.save_reminder({ ...this.state, reminderName });
      this._isMounted && this.setState({ saveLoading: false });
    } catch (error) {
      this._isMounted && this.setState({ titleError: error.message, saveLoading: false });
    }
  }

  reminderNames = ['house', 'medicine', 'appointment', 'other'];

  _delete = async () => {
    this.setState({ deleteLoading: true });
    try {
      await this.props.delete_reminder(this.state);
      this.setState({ deleteLoading: false });
      this.props.closeModal();
    } catch (error) {
      this.setState({ status: error, deleteLoading: false });
    }
  }

  _deleteWithConfirm = () => {
    Alert.alert(
      'Dikkat!',
      `"${this.state.title}", silinecek! Emin misiniz?`,
      [
        { text: 'İptal', onPress: () => { } },
        { text: 'Tamam', onPress: () => this._delete() },
      ],
      { cancelable: false }
    );
  };

  _cancel = () => {
    this.props.closeModal();
  };

  componentDidMount = () => {
    console.log('ReminderFormMount this._key:', this.state);
    this._isMounted = true;
    if (this.props.reminder.key || this.props.reminder.selectedDate) {
      this.setState({ ...this.props.reminder });
    }
  }

  static getDerivedStateFromProps(newProps, state) {
    //console.log("Reminder getDerivedState newProps", newProps);
    //console.log("Reminder getDerivedState oldState", state);

    const { speechError, speechResult } = newProps;
    const { listeningKey } = state;

    let newState = state;

    // If there is no listeningKey, newProps came from state changes
    if (!listeningKey) return null;
    // If we are here, there is a listeningKey, that is to say, newProps came from SST

    // Check if STT returns a new error
    if (speechError) {
      // and set errorMessage to corresponding component's errorMessage  
      newState[listeningKey + 'Error'] = speechError;
      // and we shall reset listeningKey to '', before returning
      newState['listeningKey'] = '';
      //console.log('Reminder getDerivedStateFromProps new state wrt error:', newState);
      return newState;
    }

    // Check if speechReult is empty string
    if (!speechResult) return null;

    //newState['lastSpeechText'] = speechResult;

    if (listeningKey == 'date') {
      // if it is date, setState({ date, time })
      const [date, time] = speechResult.split(" ");
      if (!date || !time) return null;
      // Set date and time
      newState['selectedDate'] = date;
      newState['selectedTime'] = time;
      // Reset error messsage for date
      newState[listeningKey + 'Error'] = '';
      // and we shall reset listeningKey to '', so we can use SST again
      newState['listeningKey'] = '';
      //console.log('Reminder getDerivedStateFromProps new state wrt date:', newState);
      return newState;
    }
    if (listeningKey) {
      // otherwise set result to related state key
      newState[listeningKey] = speechResult;
      newState[listeningKey + 'Error'] = '';
      // and we shall reset listeningKey to '', so we can use SST again
      newState['listeningKey'] = '';
      //newState['lastSpeechError'] = '';
      //console.log('Reminder getDerivedStateFromProps new state wrt title:', newState);
      return newState;
    }

    return null;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

}

const styles = {
  containerStyle: {
    flex: 1,
  },
  cardStyle: {
    paddingBottom: 20
  },
};

export default withSpeech(connect(null, { save_reminder, delete_reminder })(ReminderForm));