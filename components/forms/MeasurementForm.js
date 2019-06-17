import React, { Component } from 'react';
import { KeyboardAvoidingView, ScrollView, Alert, View } from 'react-native';
import { connect } from 'react-redux';

import { RadioButtons, MoodButtons, HungerConditionButtons, VitalInput, NoteInput, RowItem, Label, H3, MicIcon, ErrorLabel } from "../common";
import withSpeech from '../common/withSpeech';
import { save_measurement, delete_measurement } from '../../appstate/actions';
import {
  CardItem,
  _alert,
  SaveButton,
  CancelButton,
  DeleteButton
} from '../common';
import { MEASUREMENT_TYPES, MEASUREMENT_TYPES_PLACEHOLDERS, HUNGER_CONDITION, MOODS } from '../../constants/Options';
import { DatePicker, TimePicker } from '../common';

GLUCOSE_RANGE = { min: 30, max: 300 };
BPHIGH_RANGE = { min: 50, max: 350 };
BPLOW_RANGE = { min: 50, max: 350 };
WEIGHT_RANGE = { min: 40, max: 350 };

class MeasurementForm extends Component {

  INITIAL_STATE = {
    /** Meta-data */
    lastSpeechText: '',
    lastSpeechError: '',
    listeningKey: '',
    /** Measurement Data */
    measurementType: 0,
    measurementName: 'glucose',
    glucose: '',
    hungerIndex: 0,
    hungerCondition: HUNGER_CONDITION[0],
    bpHigh: '',
    bpLow: '',
    pulse: '',
    mood: 1,
    weight: '',
    note: '',
    /** Error Messages */
    glucoseError: '',
    bpHighError: '',
    bpLowError: '',
    pulseError: '',
    noteError: '',
    dateError: '',
    weightError: '',
    /** Loading and button status */
    disabledMeasurements: false,
    saveLoading: false,
    deleteLoading: false,
  };

  state = this.INITIAL_STATE;

  _measurementTypeButtons = MEASUREMENT_TYPES.TR;

  _placeholders = MEASUREMENT_TYPES_PLACEHOLDERS;

  _hungerConditionButtons = HUNGER_CONDITION;

  _moodButtons = MOODS;

  _isMounted = false;

  _renderInputComponent = () => {
    switch (this.state.measurementName) {
      case 'glucose':
        // Glucose
        return (
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <VitalInput
              key='glucose'
              label="Şeker değeri"
              placeholder="Ör. 80 (mg/dl)"
              value={this.state.glucose}
              onChangeText={(glucose) => this.setState({ glucose, glucoseError: '' })}
              errorMessage={this.state.glucoseError}
              isListening={this.state.listeningKey == 'glucose'}
              onRightIconPress={() => this.handleSpeechInput('glucose')}
              ref={input => this.glucoseInput = input}
              range={GLUCOSE_RANGE}
              leftIcon='glucose'
            />
            <HungerConditionButtons
              onPress={this.handleHungerCondition}
              selectedIndex={this.state.hungerIndex}
              buttons={this._hungerConditionButtons}
            />
          </View>
        );
      case 'bp':
        // Blood pressure
        return (
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <VitalInput
              key='bpHigh'
              label="Yüksek tansiyon değeri"
              placeholder="Ör. 120 (mmHg)"
              value={this.state.bpHigh}
              onChangeText={(bpHigh) => this.setState({ bpHigh, bpHighError: '' })}
              leftIcon='bpHigh'
              onRightIconPress={() => this.handleSpeechInput('bpHigh')}
              errorMessage={this.state.bpHighError}
              range={BPHIGH_RANGE}
              ref={input => this.bpHighInput = input}
            />
            <VitalInput
              key='bpLow'
              label="Düşük tansiyon değeri"
              placeholder="Ör. 80 (mmHg)"
              value={this.state.bpLow}
              onChangeText={(bpLow) => this.setState({ bpLow, bpLowError: '' })}
              leftIcon='bpLow'
              onRightIconPress={() => this.handleSpeechInput('bpLow')}
              errorMessage={this.state.bpLowError}
              range={BPLOW_RANGE}
              ref={input => this.bpLowInput = input}
            />
            <VitalInput
              key='pulse'
              label="Nabız değeri"
              placeholder="Ör. 80 (/dk)"
              value={this.state.pulse}
              onChangeText={(pulse) => this.setState({ pulse, pulseError: '' })}
              leftIcon='pulse'
              onRightIconPress={() => this.handleSpeechInput('pulse')}
              errorMessage={this.state.pulseError}
              ref={input => this.pulseInput = input}
            />
          </View>
        );
      case 'mood':
        // MOOD
        return (
          <MoodButtons
            onPress={(mood) => this.setState({ mood })}
            selectedIndex={this.state.mood}
            buttons={this._moodButtons}
          />
        );
      case 'weight':
        return (
          // WEIGHT
          <VitalInput
            key='weight'
            label="Kilo"
            placeholder="Ör. 65 (kg)"
            value={this.state.weight}
            onChangeText={(weight) => this.setState({ weight, weightError: '' })}
            leftIcon='weight'
            onRightIconPress={() => this.handleSpeechInput('weight')}
            errorMessage={this.state.weightError}
            range={WEIGHT_RANGE}
            ref={input => this.weightInput = input}
          />
        );
      default:
        break;
    }
  }

  handleSpeechInput = (listeningKey) => {
    this.setState({
      listeningKey,
      [listeningKey + 'Error']: 'Dinliyorum...',
    });

    this.props.startListening(listeningKey);
  }

  handleMeasurementType = (measurementType) => {
    this.setState({ ...this.INITIAL_STATE, measurementType, measurementName: MEASUREMENT_TYPES.EN[measurementType] })
  }

  handleHungerCondition = (hungerIndex) => {
    this.setState({ hungerIndex, hungerCondition: HUNGER_CONDITION[hungerIndex] })
  }

  render() {
    return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior="padding" enabled>
          <View style={{ flex: 1 }}>
            <H3>Ölçüm Ekle</H3>
            <Label>Bir ölçüm seçiniz</Label>
            <CardItem>
              <RadioButtons
                onPress={this.handleMeasurementType}
                selectedIndex={this.state.measurementType}
                buttons={MEASUREMENT_TYPES.TR}
                disabled={this.state.disabledMeasurements}
              />
            </CardItem>
            <CardItem>
              {this._renderInputComponent()}
            </CardItem>
            <View>
              <Label>Tarih ve Saat</Label>
              <CardItem>
                <DatePicker
                  selectedDate={this.state.selectedDate}
                  onDateChange={(selectedDate) => this.setState({ selectedDate })}
                />
                <TimePicker
                  selectedTime={this.state.selectedTime}
                  onTimeChange={(selectedTime) => this.setState({ selectedTime })}
                />
                <MicIcon
                  isListening={(this.state.listeningKey == 'date')}
                  onPress={() => this.handleSpeechInput("date")}
                />
              </CardItem>
              <ErrorLabel>{this.state.dateError}</ErrorLabel>
            </View>
            <CardItem>
              <NoteInput
                label="Not"
                placeholder={MEASUREMENT_TYPES_PLACEHOLDERS[this.state.measurementType]}
                value={this.state.note}
                onChangeText={(note) => this.setState({ note })}
                errorMessage={this.state.noteError}
                onRightIconPress={() => this.handleSpeechInput("note")}
              />
            </CardItem>
            <CardItem>
              <CancelButton
                onPress={this._cancel}
              />
              {this.renderDeleteButton()}
              <SaveButton
                onPress={this._save}
                loading={this.state.saveLoading}
              />
            </CardItem>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }

  componentDidMount = () => {
    this._isMounted = true;
    const { key, measurementName, selectedDate } = this.props.measurement;

    if (key) {
      let measurementType = 0;
      const disabledMeasurements = [];
      for (let i = 0; i < MEASUREMENT_TYPES.EN.length; i++) {
        if (MEASUREMENT_TYPES.EN[i] !== measurementName) disabledMeasurements.push(i);
        else measurementType = i;
      }
      this.setState({ ...this.props.measurement, measurementType, disabledMeasurements });
    }

    if (selectedDate) this.setState({ selectedDate })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  renderDeleteButton = () => {
    if (this.state.key) {
      return (
        <DeleteButton
          onPress={this._deleteWithConfirm}
          loading={this.state.deleteLoading}
        />
      );
    }
  }

  _delete = async () => {
    this.setState({ deleteLoading: true });
    try {
      await this.props.delete_measurement(this.state);
      this.setState({ deleteLoading: false });
      this.props.closeModal(false);
    } catch (error) {
      this.setState({ error, deleteLoading: false });
    }
  }

  _deleteWithConfirm = () => {
    Alert.alert(
      'Dikkat!',
      `"${MEASUREMENT_TYPES.TR[this.state.measurementType]}" ölçümü silinecek! Emin misiniz?`,
      [
        { text: 'İptal', onPress: () => { } },
        { text: 'Tamam', onPress: () => this._delete() },
      ],
      { cancelable: false }
    );
  };

  _save = async () => {
    let measurementData = {
      selectedDate: this.state.selectedDate,
      selectedTime: this.state.selectedTime,
    };

    if (this.state.key) measurementData['key'] = this.state.key;

    measurementData['measurementName'] = MEASUREMENT_TYPES.EN[this.state.measurementType];

    const { measurementName, glucose, hungerCondition, bpHigh, bpLow, pulse, mood, weight } = this.state;

    switch (measurementName) {
      case 'glucose':
        /** If Glocuse measurement is selected */
        if (!this.glucoseInput.isValid()) return;
        measurementData['glucose'] = glucose;
        measurementData['hungerCondition'] = hungerCondition;
        break;
      case 'bp':
        /** If Blood Pressure measurement is selected */
        if (!this.bpHighInput.isValid()) return;
        if (!this.bpLowInput.isValid()) return;
        if (!this.pulseInput.isValid()) return;
        measurementData['bpHigh'] = bpHigh;
        measurementData['bpLow'] = bpLow;
        measurementData['pulse'] = pulse;
        break;
      case 'mood':
        measurementData['mood'] = mood;
        break;
      case 'weight':
        /** If Weight measurement is selected */
        if (!this.weightInput.isValid()) return;
        measurementData['weight'] = weight;
        break;
      default:
        break;
    }

    measurementData['note'] = this.state.note;

    this.setState({ saveLoading: true });
    try {
      this.props.closeModal();
      await this.props.save_measurement(measurementData);
    } catch (error) {
      this._isMounted && this.setState({ error, saveLoading: false });
    }
    this._isMounted && this.setState({ saveLoading: false });
  }

  _cancel = () => {
    this.props.closeModal();
  }

  static getDerivedStateFromProps(newProps, state) {
    const { speechError, speechResult } = newProps;
    const { listeningKey } = state;

    let newState = state;

    // If there is no listeningKey, newProps came from state changes
    if (!listeningKey) return null;
    // So, there is a listeningKey, before continuing the make use of speechResult 

    // Check if STT returns error 
    if (speechError) {
      // and set errorMessage to corresponding component error message
      newState[listeningKey + 'Error'] = speechError;
      // and we shall reset listeningKey to '', before returning
      newState['listeningKey'] = '';
      console.log('Measurement getDerivedStateFromProps new state wrt error:', newState);
      return newState;
    }
    // Check if speechResult is empty string
    if (!speechResult) return null;

    if (listeningKey == 'date') {
      // if it is date, setState({ date, time })
      const [date, time] = speechResult.split(" ");
      if (!date || !time) return null;
      newState['selectedDate'] = date;
      newState['selectedTime'] = time;
      // and we shall reset listeningKey to '', before returning
      newState[listeningKey + 'Error'] = '';
      // and reset listeningKey to ''
      newState['listeningKey'] = '';
      console.log('Measurement getDerivedStateFromProps new state wrt date:', newState);
      return newState;
    }
    if (listeningKey) {
      // otherwise set result to related state key
      newState[listeningKey] = speechResult;
      newState[listeningKey + 'Error'] = '';
      // and we shall reset listeningKey to '', before returning
      newState['listeningKey'] = '';
      console.log('Measurement getDerivedStateFromProps new state wrt listeningKey:', newState);
      return newState;
    }

    return null;

  }

}

const styles = {
  cardStyle: {
    paddingBottom: 20
  },
  cardItemStyle: {
    flexType: "space-between",
  }
};


export default withSpeech(connect(null, { save_measurement, delete_measurement })(MeasurementForm));
