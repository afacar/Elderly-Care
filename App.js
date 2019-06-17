import React from 'react';
import { Platform, StatusBar, StyleSheet, View, YellowBox, AsyncStorage, Alert } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';

import store from './appstate/store';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    YellowBox.ignoreWarnings(['Setting a timer', 'Remote debugger', 'Require cycle:']);
  }

  render() {
    return (
      <Provider store={store} >
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppNavigator />
        </View>
      </Provider>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
