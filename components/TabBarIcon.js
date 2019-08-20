import React from 'react';
import { Icon } from 'react-native-elements';

import Colors from '../constants/Colors';

export default class TabBarIcon extends React.Component {
  render() {
    return (
      <Icon
        type={this.props.type || "ionicons"} 
        name={this.props.name}
        size={this.props.focused ? 35: 29}
        style={{ margin: 0, padding: 0 }}
        containerStyle={{ margin: 0, padding: 0 }}
        color={this.props.focused ? this.props.color : Colors.tabIconDefault}
      />
    );
  }
}