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
import ProviderProfileScreen from '../ScreensProvider/ProviderProfileScreen';
import ProviderSettingsScreen from '../ScreensProvider/ProviderSettingsScreen';
import ProviderConsultancySettingsScreen from '../ScreensProvider/ProviderConsultancySettingsScreen';
import ProviderWalletScreen from '../ScreensProvider/ProviderWalletScreen';
import ProviderArchiveScreen from '../ScreensProvider/ProviderArchiveScreen';
import ProviderPQScreen from '../ScreensProvider/ProviderPQScreen';
import UserProfileScreen from '../ScreensAuth/UserProfileScreen';
import CaregiverAnswerScreen from '../ScreensProvider/CaregiverAnswerScreen';
import ProviderChatSettingsScreen from '../ScreensProvider/ProviderChatSettingsScreen';

const ProviderHomeStack = createStackNavigator({
  ProviderHome,
  ProviderMessageScreen,
  UserProfileScreen,
  CaregiverList,
  PatientScreen,
  ChartScreen,
  CaregiverAnswerScreen
});

ProviderHomeStack.navigationOptions = {
  tabBarLabel: 'Hastalarım',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      type={'font-awesome'}
      name="user-md"
      focused={focused}
      color='blue'
    />
  ),
};

const ProviderConsultancyStack = createStackNavigator({
  ProviderConsultancySettingsScreen: {
    screen: ProviderConsultancySettingsScreen,
  },
  // ProviderChatSettingsScreen,
  // ProviderAppointmentSettingsScreen,
  // ProviderPQScreen
});

const ProviderSettingsStack = createStackNavigator({
  ProviderSettingsScreen,
  ProviderProfileScreen,
  ProviderConsultancySettingsScreen,
  ProviderWalletScreen,
  ProviderArchiveScreen,
  ProviderMessageScreen,
  ProviderPQScreen,
  ProviderChatSettingsScreen
});

ProviderSettingsStack.navigationOptions = {
  tabBarLabel: 'Ayarlar',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `settings${focused ? '' : '-outline'}` : 'settings'}
      //color='orange'
    />
  ),
};

export default createBottomTabNavigator(
  {
    ProviderHomeStack,
    ProviderSettingsStack,
  }, {
    initialRouteName: 'ProviderHomeStack',
    tabBarOptions: {
      showLabel: false,
      keyboardHidesTabBar: true,
    }
  }
);
