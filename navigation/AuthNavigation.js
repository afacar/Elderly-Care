import { createStackNavigator } from 'react-navigation';

import LoginScreen from '../ScreensAuth/LoginScreen';
import ProviderLoginScreen from '../ScreensAuth/ProviderLoginScreen';

export default AuthNavigation = createStackNavigator({
  LoginScreen,
  ProviderLoginScreen,
  },
  {
    initialRouteName: 'LoginScreen'
  }
);
