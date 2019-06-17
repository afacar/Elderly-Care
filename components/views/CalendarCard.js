import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { ListItem, Icon, Card, Text, Button } from "react-native-elements";

import { EditIcon } from "../common";
import { MEASUREMENT_TYPES, REMINDER_TYPES, HUNGER_CONDITION, MOODS, REPEAT_TYPES } from '../../constants/Options';

COLORS = {
  reminder: '#e5cce5',
  measurement: '#ccccff',
}

export class CalendarCard extends Component {
  render() {
    let title, subtitle, color = '';
    const item = this.props.item;

    
    ReminderIcons = [
      <Icon key='houseworkIcon' type='material-community' name='pot' size={28} containerStyle={{ marginRight: 5 }} />, // Ev işleri
      <Icon key='medicIcon' type='material-community' name='pill' size={28} color='blue' containerStyle={{ marginRight: 5 }} />, // İlaç
      <Icon key='appointmentIcon' type='material' name='group' size={28} containerStyle={{ marginRight: 5 }} />, // Randevu
      <Icon key='otherIcon' type='antdesign' name='notification' size={28} color='green' containerStyle={{ marginRight: 5 }} />, // Diğer...
    ];
    reminderIcon = ReminderIcons[item.reminderType];
    if (item.title) {
      // if there is a title, item is a REMINDER
      title = (
        <View style={{ flexDirection: 'row' }}>
          {reminderIcon}
          <Text h4 style={{ color: 'black' }} textBreakStrategy="highQuality">{item.title.substr(0, 19)}</Text>
        </View>
      );
      subtitle = (
        <View style={{ marginTop: 5, flex:1, flexDirection:'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{`⏰ ${REPEAT_TYPES.TR[item.repeat]} saat ${item.selectedTime}`}</Text>
          <EditIcon onPress={() => this.props.openModal(item, 'reminder')} />
        </View>
      );
        color=COLORS.reminder;
    } else {
      color=COLORS.measurement;
      // if there is NOT a title, item is a MEASUREMENT
      MeasurementIcons = {
        glucose: <Icon key='glucoseIcon' type='entypo' name='drop' size={28} color='red' containerStyle={{ marginRight: 5 }} />, // Şeker
        bp: <Icon key='bpIcon' type='material-community' name='heart-pulse' size={28} color='red' containerStyle={{ marginRight: 5 }} />, // Tansiyon
        mood: <Icon key='moodIcon' type='material' name='mood' size={28} color='black' containerStyle={{ marginRight: 5 }} />, // Ruh hali
        weight: <Icon key='wightIcon' type='material-community' name='weight-kilogram' size={28} color='brown' containerStyle={{ marginRight: 5 }} />, // Kilo
      };
      measurementIcon = MeasurementIcons[item.measurementName];
      const name = item.measurementName;
      switch (name) {
        case 'glucose':
          // Glucose
          title = (
            <View style={{ color: 'black', flexDirection: 'row' }}>
              {measurementIcon}
              <Text h4 style={{ color: 'black' }}>{`${item.glucose} mg/dl`}</Text>
            </View>
          );
          subtitle = (
            <View style={{ marginTop: 5, flex:1, flexDirection:'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 17 }}>{`${item.hungerCondition} karnına şeker ölçümü.\nSaat: ${item.selectedTime}`}</Text>
              <EditIcon onPress={() => this.props.openModal(item, 'measurement')} />
            </View>
          );
          break;
        case 'bp':
          // Blood Pressure
          title = (
            <View style={{ flexDirection: 'row' }}>
              {measurementIcon}
              <Text h4 style={{ color: 'black' }} textBreakStrategy="highQuality">{`Sys: ${item.bpHigh} (mmHg)\nDia: ${item.bpLow} (mmHg) \nNbz: ${item.pulse} (Dk)`}</Text>
            </View>
          );
          subtitle = (
            <View style={{ marginTop: 5, flex:1, flexDirection:'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 17 }}>{'Tansiyon ölçümü! Saat: ' + item.selectedTime + '\nNot: ' + item.note.substr(0, 51)}</Text>
              <EditIcon onPress={() => this.props.openModal(item, 'measurement')} />
            </View>
          );
          break;
        case 'mood':
          // Mood
          title = (
            <View style={{ flexDirection: 'row' }}>
              {measurementIcon}
              <Text style={{ color: 'black' }} h4>{'Ruh Hali: ' + MOODS[item.mood]}</Text>
            </View>
          );
          subtitle = (
            <View style={{ marginTop: 5, flex:1, flexDirection:'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 17 }}>{`Not: ${item.note.substr(0, 51)}`}</Text>
              <EditIcon onPress={() => this.props.openModal(item, 'measurement')} />
            </View>
          );
          break;
        case 'weight':
          // Weight
          title = (
            <View style={{ flexDirection: 'row' }}>
              {measurementIcon}
              <Text style={{ color: 'black' }} h4>{`${item.weight} Kg.`}</Text>
            </View>
          );
          subtitle = (
            <View style={{ marginTop: 5, flex:1, flexDirection:'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 17 }} >
                <Text style={{ fontWeight: 'bold' }}>Not: </Text>
                {`${item.note.substr(0, 51)}`}
              </Text>
              <EditIcon onPress={() => this.props.openModal(item, 'measurement')} />
            </View>
          );
          break;
      }
    }

    return (
      <Card
        title={title}
        containerStyle={{ margin: 1, borderRadius: 11, borderWidth: 3, borderColor: color }}
      >
        {subtitle}
      </Card>
    );
  }
}

export class EmptyCalendarCard extends Component {
  render() {
    const currentDate = this.props.currentDate;

    return (
      <View style={styles.emptyDateStyle}>
        <Button
          icon={{
            type: 'ionicon',
            name: "md-notifications",
            size: 33,
            color: '#e5cce5',
          }}
          title="Hatırlatma Ekle"
          onPress={() => this.props.openModal({ selectedDate: currentDate }, 'reminder')}
          buttonStyle={{ borderWidth: 0, borderRadius: 11, backgroundColor: 'transparent' }}
          titleStyle={{ color: '#909493' }}
        />
        <Button
          icon={{
            type: 'ionicon',
            name: "md-thermometer",
            size: 33,
            color: '#e5e5ff',
          }}
          title="Ölçüm Ekle"
          onPress={() => this.props.openModal({ selectedDate: currentDate }, 'measurement')}
          buttonStyle={{ borderWidth: 0, borderRadius: 11, backgroundColor: 'transparent' }}
          titleStyle={{ color: '#909493' }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemStyle: {
    backgroundColor: 'yellow',
    flex: 1,
    borderColor: 'grey',
    borderBottomWidth: 1,
    borderRightWidth: 3,
    borderRadius: 35,
    marginTop: 17,
    //padding: 10,
    marginRight: 10,
  },
  emptyDateStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 17,
    marginRight: 10,
  }
});
