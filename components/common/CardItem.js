import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';


export class CardItem extends Component {
  state = { hasError: false };

  componentDidCatch(error, info) {
    console.error("CardItemCaught error", error, info);
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      const { error, info } = this.state;
      return (
        <View>
          <Text>Bir sorun var! {`\nError:${error} \n\nInfo:${JSON.stringify(info)}`}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.rowStyle, this.props.style]}>
        {this.props.label && <Text style={styles.labelStyle}>{this.props.label}</Text>}
        <View style={styles.contentStyle}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowStyle: {
    borderWidth: 0,
    padding: 5,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderColor: '#ddd',
    position: 'relative'
  },
  columnStyle: {
    borderWidth: 0,
    padding: 5,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#ddd',
    position: 'relative'
  },
  contentStyle: {
    flexDirection: 'row',
  },
  labelStyle: {
    fontWeight: "bold",
    alignContent: "center",
    paddingRight: 30,
  },
});