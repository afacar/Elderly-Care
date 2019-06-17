import React, { Component } from 'react';
import { Text, View, StyleSheet, Picker } from 'react-native';

export class ListPicker extends Component {
  state = {
    selection: ''
  };

  _isMounted = false;

  render() {
    const { label, onValueChange, selectedValue, options } = this.props;
    return (
      <View style={styles.containerStyle}>
        {label && <Text style={styles.labelStyle}>{label || ''}</Text>}
        <View style={styles.pickerStyle}>
          <Picker
            selectedValue={selectedValue || ''}
            onValueChange={(itemValue, itemIndex) => onValueChange(itemValue)}
          >
            <Picker.Item key='nokey' label='Seçiniz...' value='' />
            {
              options.map((item, index) => {
                return <Picker.Item key={index} label={item} value={item} />;
              })
            }
          </Picker>
        </View>
      </View>
    );
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 10,
    marginRight: 10,
    alignContent: 'center',
    justifyContent: 'center',
  },
  pickerStyle: {
    flex: 1,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  labelStyle: {
    alignSelf: 'center',
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#00004c',
  }
});
