import React from 'react';
import { ScrollView, Image, View, StyleSheet, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';

import * as actions from '../appstate/actions';
import GlucoseView from "../components/views/GlucoseView";
import BPView from "../components/views/BPView";
import WeightView from "../components/views/WeightView";
import { ListPicker, RowItem, CardItem, FilterIcon } from "../components/common";
import { MONTHS } from '../constants/Options';
import { Button, Icon } from 'react-native-elements';

class ChartScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Ölçümler`,
    headerForceInset: {vercical: 'never'},
  });

  isMounted = false;

  state = {
    glucoseData: [],
    bpData: [],
    weightData: [],
    glucose: [],
    bp: [],
    mood: [],
    weight: [],
    selectedYear: new Date().getFullYear() + '',
    selectedMonth: MONTHS.TR[new Date().getMonth()],
  };

  handleDateChange = async () => {
    await this.setState(prevState => {
      let glucoseData = prevState.glucose.filter((item, index) => {
        console.log('glucose item:', item);
        if (item.selectedDate.split('-')[0] == prevState.selectedYear &&
          MONTHS.TR[parseInt(item.selectedDate.split('-')[1]) - 1] == prevState.selectedMonth) {
          console.log('returning glucose item:', item);
          return item;
        }
      });

      let bpData = prevState.bp.filter((item, index) => {
        console.log('bp item:', item);
        if (item.selectedDate.split('-')[0] == prevState.selectedYear &&
          MONTHS.TR[parseInt(item.selectedDate.split('-')[1]) - 1] == prevState.selectedMonth) {
          return item;
        }
      });

      let weightData = prevState.weight.filter((item, index) => {
        console.log('weight item:', item);
        if (item.selectedDate.split('-')[0] == prevState.selectedYear &&
          MONTHS.TR[parseInt(item.selectedDate.split('-')[1]) - 1] == prevState.selectedMonth) {
          return item;
        }
      });

      prevState.glucoseData = glucoseData;
      prevState.bpData = bpData;
      prevState.weightData = weightData;

      console.log('handleDataChange is returnin newstate', prevState);
      return prevState;
    });
  }


  renderDatePicker = () => {
    return (
      <CardItem>
        {/* <ListPicker
          options={['2019', '2020']}
          onValueChange={(selectedYear) => this.setState({ selectedYear })}
          selectedValue={this.state.selectedYear} />
        <ListPicker
          options={MONTHS.TR}
          onValueChange={(selectedMonth) => this.setState({ selectedMonth })}
          selectedValue={this.state.selectedMonth} /> */}
        <FilterIcon onPress={this.handleDateChange} />
      </CardItem>
    );
  }

  render() {
    const { glucoseData, bpData, weightData, selectedMonth, selectedYear } = this.state;
    return (
      <ScrollView>
        {this.renderDatePicker()}
        <GlucoseView year={selectedYear} month={selectedMonth} glucose={glucoseData.length > 1 ? glucoseData : null} />
        <BPView year={selectedYear} month={selectedMonth} bp={bpData.length > 1 ? bpData : null} />
        <WeightView year={selectedYear} month={selectedMonth} weight={weightData.length > 1 ? weightData : null} />
      </ScrollView>
    );
  }

  async componentDidMount() {
    this._isMounted = true;
    await this.fetchData();
  }

  fetchData = async () => {
    let userid = this.props.navigation.getParam('userid', '');
    console.log('ChartScreen didMount with initial state and userid:', this.state);

    await this.props.fetch_measurements(this.setGlucose, 'glucose', userid);
    await this.props.fetch_measurements(this.setBP, 'bp', userid);
    await this.props.fetch_measurements(this.setWeight, 'weight', userid);

    console.log('ChartScreen didMount with final state:', this.state);
    //await this.handleDateChange();
  }

  setGlucose = (measurements) => {
    const keys = Object.keys(measurements);

    this._isMounted && this.setState(previousState => {

      for (let i = 0; i < keys.length; i++) {
        const measurement = measurements[keys[i]];
        previousState.glucose.push(measurement);
        if (measurement.selectedDate.split('-')[0] == previousState.selectedYear &&
          MONTHS.TR[parseInt(measurement.selectedDate.split('-')[1]) - 1] == previousState.selectedMonth) {
          previousState.glucoseData.push(measurement);
        }
      }

      return previousState;
    });
  }

  setBP = (measurements) => {
    const keys = Object.keys(measurements);

    this._isMounted && this.setState(previousState => {

      for (let i = 0; i < keys.length; i++) {
        const measurement = measurements[keys[i]];
        previousState.bp.push(measurement);
        if (measurement.selectedDate.split('-')[0] == previousState.selectedYear &&
          MONTHS.TR[parseInt(measurement.selectedDate.split('-')[1]) - 1] == previousState.selectedMonth) {
          previousState.bpData.push(measurement);
        }
      }

      return previousState;
    });
  }

  setWeight = (measurements) => {
    const keys = Object.keys(measurements);

    this._isMounted && this.setState(previousState => {

      for (let i = 0; i < keys.length; i++) {
        const measurement = measurements[keys[i]];
        previousState.weight.push(measurement);
        if (measurement.selectedDate.split('-')[0] == previousState.selectedYear &&
          MONTHS.TR[parseInt(measurement.selectedDate.split('-')[1]) - 1] == previousState.selectedMonth) {
          previousState.weightData.push(measurement);
        }
      }

      return previousState;
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

}

export default connect(null, actions)(ChartScreen);

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    margin: 5,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  buttonStyle: {
    marginTop: 15,
    borderRadius: 20,
    backgroundColor: '#096887',
  }
});