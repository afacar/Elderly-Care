import React, { Component } from 'react';
import { Input } from 'react-native-elements';

import { MicIcon, GlucoseIcon, HBPIcon, LBPIcon, PulseIcon, WeightIcon } from "./Icons";

ICONS = {
  glucose: <GlucoseIcon />,
  bpHigh: <HBPIcon />,
  bpLow: <LBPIcon />,
  pulse: <PulseIcon />,
  weight: <WeightIcon />
};

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export class EmailInput extends Component {
  render() {
    const { label, placeholder, value, onChangeText } = this.props;

    return (
      <Input
        label={label || 'E-posta'}
        labelStyle={styles.labelStyle}
        keyboardType='email-address'
        placeholder={placeholder || 'ornek@mail.com'}
        maxLength={100}
        value={value}
        onChangeText={onChangeText}
        containerStyle={{ paddingBottom: 10 }}
      />
    );
  }

  isValid = () => {
    const { value, must, errorMessage } = this.props;

    if (!must && !value.trim()) return true;
    if (validateEmail(value)) return true;
    this.input.shake();
    const message = errorMessage || `Geçerli bir Eposta giriniz`;
    this.setState({ errorMessage: message });
    return false;
  }
}

export class TextInput extends Component {
  state = {
    errorMessage: '',
  }

  render() {
    const { label, placeholder, value, onChangeText, errorMessage, editable,multiline } = this.props;

    return (
      <Input
        label={label || ''}
        editable={editable}
        labelStyle={styles.labelStyle}
        errorMessage={errorMessage}
        multiline={multiline}
        maxLength={150}
        placeholder={placeholder || ''}
        value={value}
        onChangeText={onChangeText}
        ref={ref => this.input = ref}
      />
    );
  }

  isValid = () => {
    const { value, must } = this.props;

    if (!must || value.trim()) return true;
    
    this.input.shake();
    return false;
  }
}

export class NumericInput extends Component {
  state = {
    errorMessage: '',
  };

  render() {
    const { label, value, onChangeText, placeholder, errorMessage } = this.props;

    return (
      <Input
        label={label || ''}
        placeholder={placeholder || ''}
        errorMessage={errorMessage}
        keyboardType="numeric"
        maxLength={3}
        value={value}
        onChangeText={onChangeText}
        ref={ref => this.input = ref}
      />
    );
  }

  isValid = () => {
    const { value, must, range } = this.props;

    if (!must && !value) return true;
    if (!range) return true;
    if (value > range.min && value < range.max) return true;

    this.input.shake();
    return false;
  }
}

export class PhoneInput extends Component {
  state = {
    errorMessage: '',
  }

  render() {
    const { label, value, onChangeText, placeholder, errorMessage } = this.props;

    return (
      <Input
        label={label || 'Telefon'}
        labelStyle={styles.labelStyle}
        keyboardType='phone-pad'
        placeholder={placeholder || 'Ör. 554 123 45 67'}
        errorMessage={errorMessage || this.state.errorMessage}
        maxLength={11}
        value={value}
        onChangeText={onChangeText}
        ref={ref => this.input = ref}
      />
    );
  }

  isValid = () => {
    const { value, must } = this.props;

    if (!must && !value) return true;

    if (value.length > 9 && value.trim().length < 14) {
      return true;
    } else {
      this.input.shake();
      const message = errorMessage || `Geçerli bir numara giriniz`;
      this.setState({ errorMessage: message });
      return false;
    }
  }
}

export class NoteInput extends Component {
  state = {
    errorMessage: '',
  };

  render() {
    const {
      label,
      value,
      onChangeText,
      placeholder,
      errorMessage,
      maxLength,
      isListening,
      onRightIconPress } = this.props;

    return (
      <Input
        label={label || ''}
        labelStyle={styles.labelStyle}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        errorMessage={errorMessage}
        errorStyle={{ fontSize: 15, fontWeight: 'bold' }}
        //inputStyle={{ fontSize: 23 }}
        multiline={true}
        maxLength={maxLength || 350}
        rightIcon={onRightIconPress && <MicIcon
          isListening={isListening}
          onPress={onRightIconPress} />
        }
        ref={ref => this.input = ref}
      />
    );
  }

  isValid = () => {
    const { value, must } = this.props;

    if (!must || value.trim()) return true;
    this.input.shake();
    return false;
  }
}

export class VitalInput extends Component {
  state = {};

  render() {
    const {
      label,
      placeholder,
      value,
      onChangeText,
      leftIcon,
      isListening,
      onRightIconPress,
      errorMessage } = this.props;

    return (
      <Input
        label={label || ''}
        labelStyle={styles.labelStyle}
        placeholder={placeholder || ''}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        maxLength={5}
        leftIcon={ICONS[leftIcon]}
        rightIcon={
          <MicIcon
            isListening={isListening}
            onPress={onRightIconPress} />
        }
        //autoFocus
        errorMessage={errorMessage || this.state.errorMessage}
        errorStyle={{ fontSize: 15, fontWeight: 'bold' }}
        inputStyle={{ fontSize: 23 }}
        ref={input => this.input = input}
      />
    );
  }

  isValid = () => {
    const { value, range, errorMessage } = this.props;

    if (!range) return true;

    if (value > range.min && value < range.max) {
      return true;
    } else {
      this.input.shake();
      const message = errorMessage || `${range.min} ${range.max} arası bir değer giriniz`;
      this.setState({ errorMessage: message });
      return false;
    }
  }

}


const styles = {
  containerStyle: {
    flexDirection: 'row'
  },
  labelStyle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#00004c'
  },
  textInputStyle: {
    borderWidth: 0,
    alignItems: 'stretch',
  }
}
