import React, { Component } from 'react';
import _ from 'lodash';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { Card, Input, Text, Button } from 'react-native-elements';
import { DatePicker, CancelButton, ListPicker, TextInput } from "../common";
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-navigation';

import * as actions from '../../appstate/actions';
import { CardItem, SaveButton, NoteInput } from '../common';

class _PatientForm extends Component {
  state = {
    patient: {},
    error: '',
  };

  _isMounted = false;

  async componentDidMount() {
    /* 2. Get the param, provide a fallback value if not available */
    this._isMounted = true;
    this.props.fetch_patient((patient) => this._isMounted && this.setState({ patient }));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  savePatientData = async () => {
    //const { name, bloodtype, relation, gender, birthdate } = this.state.patient;
    try {
      await this.props.save_patient(this.state.patient);
      this.props.closeModal();
    } catch (error) {
      console.error(error.message);
    }
  };

  handleState = (newState) => {
    this.setState(prevState => {
      let patient = prevState.patient;
      for (var key in newState) {
        if (newState.hasOwnProperty(key)) {
          patient[key] = newState[key];
        }
      }
      prevState.patient = patient;
      return prevState;
    });
  }

  render() {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic"> 
          <SafeAreaView>
        <Card
          title="Hasta Bilgileri"
          titleStyle={{ fontSize: 19 }}
          containerStyle={{ margin: 1, padding: 0 }}
        >
          
          <CardItem>
            <TextInput
              label="Ad soyad"
              value={this.state.patient.name}
              placeholder="Ayşe Yılmaz"
              onChangeText={name => this.handleState({ name })}
            />
          </CardItem>
          <CardItem>
            <DatePicker
              key="birthdate"
              label="Doğum tarihi"
              containerStyle={{ flexDirection: 'row' }}
              textContainerStyle={{ borderBottomWidth: 1 }}
              selectedDate={this.state.patient.birthdate}
              onDateChange={(birthdate) => this.handleState({ birthdate, dateError: '' })}
            />
          </CardItem>
          <CardItem>
            <ListPicker
              label='Cinsiyet'
              selectedValue={this.state.patient.gender}
              onValueChange={(gender, itemIndex) => this.handleState({ gender })}
              options={['Erkek', 'Kadın']}
            />
          </CardItem>
          <CardItem>
            <ListPicker
              label='Kan grubu'
              selectedValue={this.state.patient.bloodtype}
              onValueChange={(itemValue, itemIndex) => this.handleState({ bloodtype: itemValue })}
              options={['0 (+)', '0 (-)', 'A (+)', 'A (-)', 'B (+)', 'B (-)', 'AB (+)', 'AB (-)']}
            />
          </CardItem>
          <CardItem>
            <NoteInput
              label="Tanılar"
              value={this.state.patient.diagnosis}
              placeholder="Örn. Alzheimer, Şeker, Kalp Yetmezliği"
              onChangeText={diagnosis => this.handleState({ diagnosis })}
            />
          </CardItem>
          <CardItem>
            <NoteInput
              label="İlaçlar"
              value={this.state.patient.medication}
              placeholder="Örn. Alzheimer, Şeker, Kalp Yetmezliği"
              onChangeText={medication => this.handleState({ medication })}
            />
          </CardItem>
          <CardItem>
            <NoteInput
              label="İlave Notlar"
              value={this.state.patient.notes}
              placeholder="Örn. Alerjiler"
              onChangeText={notes => this.handleState({ notes })}
            />
          </CardItem>
          <CardItem>
            <CancelButton
              onPress={this.props.closeModal}
            />
            <SaveButton
              onPress={this.savePatientData}
            />
          </CardItem>
        </Card>
        </SafeAreaView>
        </ScrollView>
      
    );
  }
}

const PatientForm = connect(null, actions)(_PatientForm);

export { PatientForm };
