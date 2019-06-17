import React from 'react';
import { Icon } from 'react-native-elements';

import Colors from '../constants/Colors';

export default class TabBarIcon extends React.Component {
  render() {
    return (
      <Icon
        type={this.props.type || "ionicons"} 
        name={this.props.name}
        size={31}
        style={{ marginBottom: -3 }}
        color={this.props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }
}