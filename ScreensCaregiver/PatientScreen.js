import React from 'react';
import { ScrollView, Image, View, TouchableHighlight, Text } from 'react-native';
import { connect } from 'react-redux';

import * as actions from '../appstate/actions';
import PatientView from '../components/views/PatientView';

class PatientScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Hasta Bilgileri`,
    headerForceInset: {vercical: 'never'},
    headerRight: (
      <View>
      <TouchableOpacity onPress={() => navigation.navigate('ChartScreen', {
        userid: navigation.getParam('userid', '')
      })}
      >
        <View style={{ alignSelf: 'flex-end', alignItems: 'center', marginRight: 10 }}>
          <Image
            style={{ width: 25, height: 20 }}
            source={require('../assets/images/charts.png')}
          />
          <Text style={{ fontWeight: 'bold' }}>Ölçümler</Text>
        </View>
      </TouchableOpacity>
      </View>
    )
  });

  state = {};

  render() {
    return (
      <ScrollView  keyboardShouldPersistTaps="handled">
        
        <PatientView userid={this.props.navigation.getParam('userid', '')} />
      </ScrollView>
    );
  }

  componentDidMount() {
    console.log('PatientScreen didMount with final state:', this.state);
  }

}

export default connect(null, actions)(PatientScreen);