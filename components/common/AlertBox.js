import { Alert } from 'react-native';

// Create an customized AlertBox component
// Which takes props (feedback message and callback function) and returns an alert box
const _alert = (feedback, callback={}) => {
    Alert.alert(
        'Dikkat!',
        feedback || "Mesaj yok!",
        [
          {text: 'Tamam', onPress: () => callback }
        ]
      );
};

export {_alert};
