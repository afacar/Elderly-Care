import React from 'react';
import { Platform, View } from 'react-native';
import { Badge } from 'react-native-elements';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../ScreensCaregiver/HomeScreen';
import PatientScreen from '../ScreensCaregiver/PatientScreen';
import ChartScreen from "../ScreensCaregiver/ChartScreen";
import ChatScreen from '../ScreensCaregiver/ChatScreen';
import UserProfileScreen from '../ScreensAuth/UserProfileScreen';
import CaregiverMessageScreen from '../ScreensCaregiver/CaregiverMessageScreen';
import SettingsStack from './SettingsNavigations';
import ProviderListScreen from '../ScreensCaregiver/ProviderListForm';

const HomeStack = createStackNavigator({
  Home: HomeScreen,
});

HomeStack.navigationOptions = {
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={'home'}
      color='blue'
    />
  ),
};

const PatientStack = createStackNavigator({
  PatientScreen,
  // Chart screen
  ChartScreen,
});

PatientStack.navigationOptions = {
  //tabBarLabel: 'Takip',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      type='font-awesome'
      name={'line-chart'}
      color='red'
    />
  ),
};

const SupportStack = createStackNavigator(
  {
    ChatScreen,
    CaregiverMessageScreen,
    UserProfileScreen,
    ProviderListScreen,
  },
  {
    initialRouteName: 'ChatScreen',
  }
);

SupportStack.navigationOptions = {
    //tabBarLabel: 'Destek',
    tabBarIcon: ({ focused }) => (
      <View>
        <TabBarIcon
          focused={focused}
          name={'chat'}
          color='green'
        />
{/*         <Badge
          value="12"
          status="success"
          containerStyle={{ position: 'absolute', top: -10, right: -4 }}
        /> */}
      </View>
    ),
};

export default createBottomTabNavigator(
  {
    HomeStack,
    PatientStack,
    SupportStack,
    SettingsStack,
  },
  {
    lazy: true,
    tabBarOptions: {
      showLabel: false,
      //activeTintColor: 'transparent',
      //activeBackgroundColor: null,
      allowFontScaling: true,
      keyboardHidesTabBar: true,
      labelStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      style: {
        backgroundColor: 'transparent',
        //height: 60,
      },
    },
  }
);
