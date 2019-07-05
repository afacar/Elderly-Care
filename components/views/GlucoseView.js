import React, { Component } from 'react';
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { VictoryLine, VictoryChart, VictoryTheme, VictoryLabel, VictoryLegend, VictoryAxis } from "victory-native";
import { Card, Text } from "react-native-elements";

import * as actions from "../../appstate/actions";

class GlucoseView extends Component {
  state = {
    data: [],
  }

  _isMounted = false;


  render() {
    return (
      <Card
        containerStyle={styles.containerStyle}
        title='Şeker seviyesi'
      >
        {this.renderChart()}
      </Card>
    );
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async componentDidMount() {
    this._isMounted = true;
    console.log('GlucoseView is Mounted with ', this.state);
    try {
      await this.props.fetch_measurements(this.setMeasurements, measurementName = 'glucose');
    } catch (error) {
      console.error(error.message);
    }
    console.log('GlucoseView is Mounted completed with ', this.state);
  }

  setMeasurements = async (measurements) => {
    this._isMounted && this.setState({ data: measurements, error: '' });
  }

  renderChart = () => {

    if (this.props.glucose) {
      const data = this.preprocessData(this.props.glucose);
      console.log('renderChart processeddata', data);
      return (
        <View pointerEvents="none">
          <VictoryChart
            theme={VictoryTheme.material}
            domain={{ x: [0, 31], y: [50, 250] }}
            animate={{ duration: 1500 }}
          //padding={10}
          >
            <VictoryAxis key='Yaxis' dependentAxis label="Ölçüm" style={{ axisLabel: { fontSize: 16, padding: 32 } }} />
            <VictoryAxis key='Xaxis' label="Tarihler" style={{ axisLabel: { fontSize: 16, padding: 32 } }} />
            <VictoryLegend x={150} y={60}
              title=""
              centerTitle
              orientation="horizontal"
              //gutter={20}
              style={{ border: { stroke: "black" }, title: { fontSize: 15 } }}
              data={[
                { name: "Şeker (mg/dl)", symbol: { fill: "#c43a31" } }
              ]}
            />
            <VictoryLine
              style={{
                data: {
                  stroke: "#c43a31", strokeWidth: 3
                }
              }}
              size={5}
              data={data}
              x="date"
              y="value"
            //labels={(datum) => datum.value + ' mg/dl'}
            //labelComponent={<VictoryLabel renderInPortal dy={-5} />}
            />
          </VictoryChart>
        </View>
      );
    } else {
      return <Text style={{ alignSelf: 'center' }}>Kayıt bulunamadı!</Text>;
    }
  }

  preprocessData = (data) => {

    data.sort(this.compare);
    console.log('sorted glucose data', data);
    let newData = [];

    for (let i = 0; i < data.length; i++) {
      const day = data[i]['selectedDate'].split('-')[2]
      const date = parseInt(day);
      const value = parseInt(data[i]['glucose']);
      const newItem = { date, value };
      newData.push(newItem);
    }

    return newData;
  }

  compare(a, b) {
    if (a.selectedDate < b.selectedDate)
      return -1;
    if (a.selectedDate > b.selectedDate)
      return 1;
    return 0;
  }

}

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

export default connect(null, actions)(GlucoseView);