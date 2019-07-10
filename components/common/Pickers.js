import React, { Component } from 'react';
import { Text, View, StyleSheet, Picker, Modal, Platform, Button, windowWidth, windowHeight } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-navigation';

export class ListPicker extends Component {
  state = {
    selection: '',
    visible: false
  };

  _isMounted = false;


  render() {
    const { label, onValueChange, selectedValue, options } = this.props;

    if (Platform.OS === 'android') {
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
    } else if (Platform.OS === 'ios') {
      return (
        <View style={styles.containerStyle}>
          {label && <Text style={styles.labelStyle}>{label || ''}</Text>}
          <View style={styles.pickerStyle}>
            <TouchableOpacity onPress={() => this.setState({ visible: true })}>
              <Text style={{fontSize:19}}>{selectedValue}</Text>
            </TouchableOpacity>
            <Modal visible={this.state.visible} transparent={true}>

              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <View style={styles.modalStyle}>

                    <Picker
                      selectedValue={selectedValue || ''}
                      onValueChange={(itemValue, itemIndex) => onValueChange(itemValue)}
                      //itemStyle={{fontSize: 20,color:'yellow'}}
                      >
                      <Picker.Item key='nokey' label='Seçiniz...' value='' />
                      {
                        options.map((item, index) => {
                          return <Picker.Item  key={index} label={item} value={item}
                           />;
                        })
                      }
                    </Picker>

                  </View>
                  <View style={styles.saveButton}>
                    <Button
                      onPress={() => this.setState({ visible: false })}
                      title="Kaydet"
                      color="blue"
                    ></Button>
                  </View>
                  <SafeAreaView style={{ width: '95%' }} forceInset={{ bottom: 'always' }} >
                    <View style={styles.cancelButton}>
                      <TouchableOpacity
                        onPress={() => this.setState({ visible: false })}>
                          <Text style={{color:'blue',fontWeight:'bold',fontSize:17}}>Iptal</Text>
                      </TouchableOpacity>
                    </View>
                  </SafeAreaView>
                </View>
              </View>
            </Modal>
          </View>
        </View>
      );
    }

  }

  componentDidMount() {
    this._isMounted = true;
    console.log('options', this.props.options)
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
  },
  saveButton: {
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '95%',
    borderTopWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderTopColor: 'grey',
    height: 57
  },
  cancelButton: {
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    marginTop: 3,
    height: 57, 
    alignItems:'center',
    
    
  },
  modalStyle: {
    backgroundColor: '#ffffff',
    width: '95%',
    height: 171,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14
  }
});
