import { createSwitchNavigator, createAppContainer } from 'react-navigation';

import SplashScreen from '../ScreensAuth/SplashScreen';
import CaregiverTabNavigator from './CaregiverTabNavigator';
import AuthNavigation from './AuthNavigation';
import ProviderTabNavigator from './ProviderNavigator';
import UserProfileScreen from '../ScreensAuth/UserProfileScreen'

const AppNavigator =  createSwitchNavigator({
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html
  // HINT: New screens without buttom navigator can be added here! 
  SplashScreen,
  Auth: AuthNavigation,
  Caregiver: CaregiverTabNavigator,
  Provider: ProviderTabNavigator,
  },
  {
    initialRouteName: 'SplashScreen',
  }
); 

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;