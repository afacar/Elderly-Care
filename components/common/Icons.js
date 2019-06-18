import React from 'react';
import { Icon } from 'react-native-elements';

import Colors from '../../constants/Colors';

export const FilterIcon = (props) => {
  return (
    <Icon
      type='antdesign'
      name='filter'
      onPress={props.onPress || null}
      size={33}
      containerStyle={{ alignSelf: 'center', paddingRight: 10 }}
    />
  );
}


export const EditIcon = (props) => {
  return (
    <Icon
      type='font-awesome'
      name="edit"
      onPress={props.onPress || null}
      size={33}
      color={props.color || 'black'}
      iconStyle={{ marginRight: 0, paddingRight: 0 }}
      containerStyle={{ alignSelf: 'flex-end' }}
    />
  );
}

export const CheckIcon = (props) => {
  return (
    <Icon
      type='entypo'
      name="check"
      onPress={props.onPress || null}
      size={33}
      color={props.color || 'green'}
    />
  );
}

export const RequestIcon = (props) => {
  return (
    <Icon
      type='entypo'
      name="direction"
      onPress={props.onPress || null}
      size={33}
      color={props.color || 'blue'}
    />
  );
}

export const DateIcon = (props) => {
  return (
    <Icon
      type='material-community'
      name='calendar'
      onPress={props.onPress || null}
      paddingRight={5}
      color='brown'
      size={28}
    />
  );
}

export const TimeIcon = (props) => {
  return (
    <Icon
      name='stopwatch'
      type='entypo'
      onPress={props.onPress || null}
      paddingRight={5}
      size={28}
      color='brown'
    />
  );
}

export const LogoutIcon = (props) => {
  return (
    <Icon
      name='logout'
      type='simple-line-icon'
      onPress={props.onPress || null}
      paddingRight={5}
      size={28}
      color='white'
      containerStyle={{ paddingRight: 10 }}
    />
  );
}

export const SaveIcon = (props) => {
  return (
    <Icon
      name='save'
      type='antdesign'
      onPress={props.onPress || null}
      paddingRight={1}
      size={24}
      color='white'
    />
  );
}

export const CancelIcon = (props) => {
  return (
    <Icon
      name='cancel'
      type='material'
      onPress={props.onPress || null}
      paddingRight={1}
      size={24}
      color='white'
    //containerStyle={{ paddingRight: 10 }}
    />
  );
}

export const DeleteIcon = (props) => {
  return (
    <Icon
      name='delete'
      type='material-community'
      onPress={props.onPress || null}
      paddingRight={1}
      size={24}
      color='white'
    //containerStyle={{ paddingRight: 10 }}
    />
  );
}

export const GlucoseIcon = (props) => {
  return (
    <Icon
      name='drop'
      type='entypo'
      onPress={props.onPress || null}
      paddingRight={5}
      size={30}
      color='#CC0000'
      iconStyle={{ paddingRight: 7 }}
    />
  );
}

export const HBPIcon = (props) => {
  return (
    <Icon
      name='angle-double-up'
      type='font-awesome'
      onPress={props.onPress || null}
      size={30}
      iconStyle={{ paddingRight: 7 }}
    />
  );
}

export const LBPIcon = (props) => {
  return (
    <Icon
      name='angle-double-down'
      type='font-awesome'
      onPress={props.onPress || null}
      size={30}
      iconStyle={{ paddingRight: 7 }}
    />
  );
}

export const PulseIcon = (props) => {
  return (
    <Icon
      name='heart-pulse'
      type='material-community'
      onPress={props.onPress || null}
      color='#cc0000'
      size={30}
      iconStyle={{ paddingRight: 7 }}
    />
  );
}

export const WeightIcon = (props) => {
  return (
    <Icon
      name='weight-kilogram'
      type='material-community'
      onPress={props.onPress || null}
      size={30}
      iconStyle={{ paddingRight: 7 }}
    />
  );
}

export const MicIcon = (props) => {
  return (
    <Icon
      name='mic'
      type='entypo'
      onPress={props.onPress || null}
      color={(props.isListening) ? 'red' : 'black'}
      size={30}
      onPress={props.onPress}
    />
  );
}