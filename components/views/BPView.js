import React, { Component } from 'react';
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { VictoryLine, VictoryChart, VictoryTheme, VictoryAxis, VictoryLegend } from "victory-native";
import { Card, Text } from "react-native-elements";

import * as actions from "../../appstate/actions";

class BPView extends Component {
  render() {
    return (
      <Card
        containerStyle={styles.containerStyle}
        title='Tansiyon seviyesi'
      >
        {this.renderChart()}
      </Card>
    );
  }

  renderChart = () => {

    if (this.props.bp) {
      const { bpHighData, bpLowData } = this.preprocessData(this.props.bp);
      return (
        <View pointerEvents="none">
          <VictoryChart
            theme={VictoryTheme.material}
            domain={{ x: [0, 30], y: [50, 350] }}
            animate={{
              duration: 2000,
            }}
          >
            <VictoryAxis key='Yaxis' dependentAxis label="Ölçüm" style={{ axisLabel: { fontSize: 16, padding: 32 } }} />
            <VictoryAxis key='Xaxis' label="Tarihler" style={{ axisLabel: { fontSize: 16, padding: 32 } }} />
            <VictoryLegend x={150} y={60}
              title=""
              centerTitle
              orientation="vertical"
              gutter={10}
              style={{ border: { stroke: "black" }, title: { fontSize: 15 } }}
              data={[
                { name: "Yüksek (mgHg)", symbol: { fill: "#c43a31" } },
                { name: "Düşük (mmHg)", symbol: { fill: "black" } },
              ]}
            />
            <VictoryLine
              style={{
                data: {
                  stroke: "#c43a31", strokeWidth: 3
                }
              }}
              data={bpHighData}
              x="date"
              y="value"
            />
            <VictoryLine
              data={bpLowData} x="date" y="value"
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
    console.log('sorted BP data', data);
    let bpHighData = [];
    let bpLowData = [];

    for (let i = 0; i < data.length; i++) {
      const date = parseInt(data[i]['selectedDate'].split('-')[2]);
      const bpHigh = parseInt(data[i]['bpHigh']);
      const bpLow = parseInt(data[i]['bpLow']);
      bpHighData.push({ date, value: bpHigh });
      bpLowData.push({ date, value: bpLow });
    }

    return { bpHighData, bpLowData };
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

export default connect(null, actions)(BPView)