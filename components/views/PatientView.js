import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Text, ListItem, Card, Icon, Overlay, Button } from "react-native-elements";

import { PatientForm } from "../forms/PatientForm";
import * as actions from "../../appstate/actions";
import { RowItem, ColumnItem, EditIcon, EditButton, LabeledItem, Label } from '../common';

class PatientView extends Component {
  state = {
    patient: {},
    error: '',
    isVisible: false,
  };

  _renderPatient = (patient) => {
    if (patient.hasOwnProperty('name')) {
      return (
        <View>
          <RowItem label="Doğum Tarihi" content={patient.birthdate} />
          <RowItem label="Cinsiyet" content={patient.gender} />
          <RowItem label="Kan Grubu" content={patient.bloodtype} />
          <ColumnItem label="Tanılar" content={patient.diagnosis} />
          <ColumnItem label="İlaçlar" content={patient.medication} />
          <ColumnItem label="İlave Notlar" content={patient.notes} />
          {!this.props.userid && <EditButton
            title='Hasta Bilgilerini Düzenle'
            onPress={() => this.setState({ isVisible: true, selectedItem: patient })}
          />}
        </View>
      );
    } else {
      return (
        <View>
          <Text h4>Hasta kaydı bulunamadı! Lütfen hastanızın bilgilerini giriniz!</Text>
          {!this.props.userid && <EditButton
            onPress={() => this.setState({ isVisible: true, selectedItem: patient })}
          />}
        </View>
      );
    }

  }

  render() {
    const { patient } = this.state;
    const { name } = patient;
    //const leftAvatar = patient.photoURL ? { source: { uri: photoURL }, size: 'large' } : { source: require('../../assets/images/family.png'), size: 'large' };
    const title = name || ' ';
    console.log('Rendering patient and title', patient, title);
    return (
      <ScrollView >
        <Card title={title}
          containerStyle={styles.containerStyle}
          titleStyle={{ fontSize: 25 }}
        >
          {this._renderPatient(patient)}
        </Card>
        <Overlay
          fullScreen
          isVisible={this.state.isVisible}
          onRequestClose={() => this._closeModal()}
        >
          <ScrollView  keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView>
              <PatientForm
                data={this.state.selectedItem}
                closeModal={this._closeModal}
              />
            </KeyboardAvoidingView>
          </ScrollView>
        </Overlay>
      </ScrollView>
    );
  }

  _closeModal = () => this.setState({ isVisible: false });

  async componentDidMount() {
    let userid = this.props.userid;
    await this.props.fetch_patient(this.setPatient, userid);
  }

  setPatient = (patient) => this.setState({ patient })

}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    margin: 20,
    padding: 0,

  },
});

export default connect(null, actions)(PatientView)