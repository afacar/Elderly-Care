import React, { Component } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { TimeIcon, DateIcon } from './Icons';
import DateTimePicker from 'react-native-modal-datetime-picker';

export class TimePicker extends Component {
  state = {
    isTimePickerVisible: false,
  };

  getTime = (date) => {
    /** Take datetime object and return string representation of time as 09:30 */
    let time = new Date(date);
    let hr = time.getHours();
    let min = time.getMinutes();

    if (hr < 10) { hr = '0' + hr }

    if (min < 10) { min = '0' + min }

    time = hr + ':' + min;

    return time;
  }

  _showTimePicker = () => this.setState({ isTimePickerVisible: true });

  _hideTimePicker = () => this.setState({ isTimePickerVisible: false });

  _handleTimePicked = (time) => {
    this.setState({ time, isTimePickerVisible: false });
    let sTime = this.getTime(time);
    this.props.onTimeChange(sTime);
  };

  render() {
    const { label, selectedTime } = this.props;
    return (
      <View style={styles.containerStyle}>
        {label && <Text style={styles.labelStyle}>{label}</Text>}
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <TimeIcon onPress={this._showTimePicker} />
          <TouchableOpacity onPress={this._showTimePicker}>
            <Text style={styles.textStyle}>{selectedTime}</Text>
          </TouchableOpacity>
          <DateTimePicker
            mode="time"
            isVisible={this.state.isTimePickerVisible}
            onConfirm={this._handleTimePicked}
            onCancel={this._hideTimePicker}
            date={this.state.time}
          />
        </View>
      </View>
    );
  }

  componentDidMount() {
    const { selectedTime, onTimeChange } = this.props;
    !selectedTime && onTimeChange(this.getTime(new Date()))
  }

}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 10,
    marginRight: 10,
    //borderWidth: 1,
    //padding: 5,
  },
  textContainerStyle: { 
    flex: 1, 
    flexDirection: 'row',
    paddingBottom: 10,
  },
  textStyle: {
    fontSize: 19,
    //fontWeight: 'bold',
    //textAlign: 'center',
    //alignSelf: 'center',
  },
  labelStyle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#00004c',
  }
});

export class DatePicker extends Component {
  state = {
    isDatePickerVisible: false,
    selectedDate: '',
  };

  getDate = (date = new Date()) => {
    let today = date;
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) { dd = '0' + dd; }

    if (mm < 10) { mm = '0' + mm; }

    today = yyyy + '-' + mm + '-' + dd;

    return today;
  }

  _showDatePicker = () => this.setState({ isDatePickerVisible: true });

  _hideDatePicker = () => this.setState({ isDatePickerVisible: false });

  _handleDatePicked = (date) => {
    this.setState({ date });
    let sDate = this.getDate(date);
    this.props.onDateChange(sDate);
    this._hideDatePicker();
  };

  render() {
    const { label, selectedDate } = this.props;
    return (
      <View style={[styles.containerStyle, this.props.containerStyle]}>
        {label && <Text style={styles.labelStyle}>{label}</Text>}
        <View style={[styles.textContainerStyle, this.props.textContainerStyle]}>
          <DateIcon onPress={this._showDatePicker} />
          <TouchableOpacity onPress={this._showDatePicker}>
            <Text style={styles.textStyle}>{selectedDate || this.getDate()}</Text>
          </TouchableOpacity>
          <DateTimePicker
            mode="date"
            isVisible={this.state.isDatePickerVisible}
            onConfirm={this._handleDatePicked}
            onCancel={this._hideDatePicker}
            date={this.state.date}
          />
        </View>
      </View>
    );
  }

  componentDidMount() {
    // this.setState({ selectedDate: this.getDate() })
    console.log("DatePicker Mounted");
    this.props.onDateChange(this.getDate());
  }

}