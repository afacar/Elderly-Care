import React, { Component } from 'react';
import { ScrollView, KeyboardAvoidingView, FlatList } from 'react-native';
import { SettingsItem } from '../components/common/Items';
import { TouchableOpacity } from 'react-native-gesture-handler';

class ProviderConsultancySettingsScreen extends Component {
    static navigationOptions = {
        title: 'Consultancy Settings',
    };

    render() {
        return (
            <ScrollView style={{marginTop: 10}}>
                    <SettingsItem
                        key='wallet'
                        text='Wallet'
                        onPress={() => this.navigateNextScreen('wallet')}
                    />
                    <SettingsItem
                        key='chat_settings'
                        text='Chat Settings'
                        onPress={() => this.navigateNextScreen('chat')}
                    />
                    <SettingsItem
                        key='appointments'
                        text='Appointments'
                        // onPress={() => this.navigateNextScreen('profile')}
                    />
                    <SettingsItem
                        key='prelim_questions'
                        text='Preliminary Questions'
                        onPress={() => this.navigateNextScreen('prelim_questions')}
                    />
            </ScrollView >
        )
    }

    navigateNextScreen = (screen) => {
        const { navigate } = this.props.navigation;
        if (screen === 'wallet') {
            navigate('ProviderWalletScreen', {navigation: this.props.navigation});
        }else if ( screen === 'prelim_questions'){
            navigate('ProviderPQScreen', {navigation: this.props.navigation});
        }else if ( screen === 'chat'){
            navigate('ProviderChatSettingsScreen', {navigation: this.props.navigation});
        }
    }
}

export default ProviderConsultancySettingsScreen;