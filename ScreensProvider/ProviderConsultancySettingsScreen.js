import React, { Component } from 'react';
import { ScrollView, KeyboardAvoidingView, FlatList } from 'react-native';
import { SettingsItem } from '../components/common/Items';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ListItem } from 'react-native-elements';

class ProviderConsultancySettingsScreen extends Component {
    static navigationOptions = {
        title: 'Danışmanlık Ayarları',
    };

    render() {
        return (
            <ScrollView style={{ marginTop: 10 }}>
                <ListItem
                    key='wallet'
                    title='Cuzdan'
                    onPress={() => this.navigateNextScreen('wallet')}
                    leftIcon={{ color: '#33cc33', type: 'antdesign', name: 'wallet' }}
                    rightIcon={{ type: 'material', name: 'keyboard-arrow-right', size: 33 }}
                    containerStyle={{ borderBottomWidth: 1, borderBottomLeftRadius: 50 }}
                />
                <ListItem
                    key='chat_settings'
                    title='Sohbet Ayarları'
                    onPress={() => this.navigateNextScreen('chat')}
                    leftIcon={{ type: 'material-community', name: 'message-settings' }}
                    rightIcon={{ type: 'material', name: 'keyboard-arrow-right', size: 33 }}
                    containerStyle={{ borderBottomWidth: 1, borderBottomLeftRadius: 50 }}
                />
                <ListItem
                    key='prelim_questions'
                    title='Ön Sorular'
                    onPress={() => this.navigateNextScreen('prelim_questions')}
                    leftIcon={{ color: '#0066ff', type: 'material-community', name: 'comment-question' }}
                    rightIcon={{ type: 'material', name: 'keyboard-arrow-right', size: 33 }}
                    containerStyle={{ borderBottomWidth: 1, borderBottomLeftRadius: 50 }}
                />
                <ListItem
                    key='appointments'
                    title='Appointments'
                    // onPress={() => this.navigateNextScreen('profile')}
                    leftIcon={{ color: '#cc3300', type: 'material-community', name: 'calendar' }}
                    rightIcon={{ type: 'material', name: 'keyboard-arrow-right', size: 33 }}
                    containerStyle={{ borderBottomWidth: 1, borderBottomLeftRadius: 50 }}
                />
            </ScrollView >
        )
    }

    navigateNextScreen = (screen) => {
        const { navigate } = this.props.navigation;
        if (screen === 'wallet') {
            navigate('ProviderWalletScreen', { navigation: this.props.navigation });
        } else if (screen === 'prelim_questions') {
            navigate('ProviderPQScreen', { navigation: this.props.navigation });
        } else if (screen === 'chat') {
            navigate('ProviderChatSettingsScreen', { navigation: this.props.navigation });
        }
    }
}

export default ProviderConsultancySettingsScreen;