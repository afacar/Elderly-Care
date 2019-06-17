import React, { Component } from 'react';
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { VictoryLine, VictoryChart, VictoryTheme, VictoryLegend, VictoryAxis } from "victory-native";
import { Card, Text } from "react-native-elements";

import * as actions from "../../appstate/actions";

class WeightView extends Component {

  render() {
    return (
      <Card
        containerStyle={styles.containerStyle}
        title='Kilo seyri'
      >
        {this.renderChart()}
      </Card>
    );
  }

  renderChart = () => {

    if (this.props.weight) {
      const { newData, average } = this.preprocessData(this.props.weight);
      return (
        <View pointerEvents="none">
          <VictoryChart
            theme={VictoryTheme.material}
            domain={{ x: [0, 30], y: [average - 15, average + 15] }}
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
                { name: "Kilo (Kg)", symbol: { fill: "#c43a31" } },
              ]}
            />
            <VictoryLine
              style={{
                data: {
                  stroke: "#c43a31", strokeWidth: 3
                }
              }}
              data={newData}
              x="date"
              y="value"
            />
          </VictoryChart>
        </View>
      );
    } else {
      return <Text h4>Kilo kaydı bulunamadı!</Text>;
    }
  }

  preprocessData = (data) => {

    data.sort(this.compare);
    console.log('sorted weight data', data);
    let newData = [];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      const date = parseInt(data[i]['selectedDate'].split('-')[2]);
      const value = parseInt(data[i]['weight']);
      sum += value;
      const newItem = { date, value };
      newData.push(newItem);
    }

    const average = sum / data.length;
    return { newData, average };
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

export default connect(null, actions)(WeightView)