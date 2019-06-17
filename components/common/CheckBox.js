import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';

export class CheckBox extends Component {

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{this.props.label || ''}</Text>
        <CheckBox
          checked={this.props.checked}
          onPress={() => {
            this.props.onRepeatChange()
          }}
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  label: {
    fontWeight:"bold",
    alignContent: "center",
    paddingRight: 30,
  },
  input: {
    flex: 1
  }
});