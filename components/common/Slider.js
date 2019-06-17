import React, { Component } from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { Slider } from 'react-native-elements';

export class Slider extends Component {

  render() {
    const { label, value, minimumValue, maximumValue, onValueChange, step, unit } = this.props;
    return (
      <View style={{ flex: 1, flexDirection: "column" }}>
        <Text style={styles.displayStyle}>{label + value + unit}</Text>
        <View style={styles.containerStyle}>
          <Text style={styles.labelStyle}>{this.props.lowestValueLabel || ''}</Text>
          <Slider
            style={styles.sliderStyle}
            value={value}
            step={step}
            minimumValue={minimumValue}
            maximumValue={maximumValue}
            onValueChange={onValueChange}
            //minimumTrackTintColor="purple"
            //maximumTrackTintColor="yellow"
            thumbStyle={{ width: 40, height: 30, borderRadius: 100 }}
            thumbTintColor="grey"
          />
          <Text style={styles.labelStyle}>{this.props.highestValueLabel || ''}</Text>
        </View>
      </View>
    );
  }

  onValueChange = (value) => {
    this.props.onValueChange(value);
  }

}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: "row"
  },
  labelStyle: {
    fontWeight: "bold",
    fontSize: 21,
    alignContent: "center",
    paddingRight: 30,
    alignSelf: 'center'
  },
  displayStyle: {
    fontWeight: "bold",
    fontSize: 21,
    alignContent: "flex-start",
    paddingRight: 30,
    alignSelf: 'center'
  },
  sliderStyle: {
    flex: 1
  }
});