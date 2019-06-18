import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import SettingsScreen from '../ScreensCaregiver/SettingsScreen';
import TabBarIcon from '../components/TabBarIcon';


export default SettingsStack = createStackNavigator({
  SettingsScreen,
  });
  
  SettingsStack.navigationOptions = {
    tabBarLabel: 'Ayarlar',
    tabBarIcon: ({ focused }) => (
      <TabBarIcon
        focused={focused}
        name={'settings'}
      />
    ),
  };