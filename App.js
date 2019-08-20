import React from 'react';
import { Platform, StatusBar, StyleSheet, View, YellowBox, AsyncStorage, Alert, ScrollView } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import { SafeAreaView } from 'react-navigation';

import store from './appstate/store';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    YellowBox.ignoreWarnings([
      'Setting a timer',
      'Remote debugger',
      'Require cycle:', 'Async Storage has been extracted from react-native core and will be removed in a future release.',
      'NetInfo has been extracted from react-native core and will be removed in a future release.',
      "WebView has been extracted from react-native core and will be removed in a future release.",
      'Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'
    ]);

  }

  render() {
    return (
      <Provider store={store} >
        <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
          <AppNavigator />
        </SafeAreaView>
      </Provider>

    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
