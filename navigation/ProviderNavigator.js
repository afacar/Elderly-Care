import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import TabBarIcon from '../components/TabBarIcon';
import ProviderHome from '../ScreensProvider/ProviderHomeScreen';
import ProviderMessageScreen from '../ScreensProvider/ProviderMessageScreen';
import ChartScreen from '../ScreensCaregiver/ChartScreen';
import PatientScreen from "../ScreensCaregiver/PatientScreen";
import CaregiverList from '../ScreensProvider/CaregiverListScreen';
import ProviderSettings from '../ScreensProvider/ProviderSettingsScreen';

const ProviderHomeStack = createStackNavigator({
  ProviderHome,
  ProviderMessageScreen,
  CaregiverList,
  PatientScreen,
  ChartScreen,
});

ProviderHomeStack.navigationOptions = {
  tabBarLabel: 'Hastalarım',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      type={'font-awesome'}
      name="user-md"
      focused={focused}
    />
  ),
};

const ProviderSettingsStack = createStackNavigator({
  ProviderSettings,
});

ProviderSettingsStack.navigationOptions = {
  tabBarLabel: 'Ayarlar',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `settings${focused ? '' : '-outline'}` : 'settings'}
    />
  ),
};

export default createBottomTabNavigator(
  {
    ProviderHomeStack,
    ProviderSettingsStack,
  }, {
    initialRouteName: 'ProviderHomeStack',
  }
);
