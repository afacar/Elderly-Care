import React, { Component } from 'react';
import { ScrollView, KeyboardAvoidingView, FlatList } from 'react-native';
import { SettingsItem } from '../components/common/Items';
import { TouchableOpacity } from 'react-native-gesture-handler';

class ProviderSettingsScreen extends Component {
    static navigationOptions = {
        title: 'Settings'
    };

    render() {
        return (
            <ScrollView style={{marginTop: 10}}>
                    <SettingsItem
                        key='profile'
                        text='Profile Settings'
                        onPress={() => this.navigateNextScreen('profile')}
                    />
                    <SettingsItem
                        key='consultancy'
                        text='Consultancy Settings'
                        onPress={() => this.navigateNextScreen('consultancy')}
                    />
                    <SettingsItem
                        key='archive'
                        text='Archive'
                        onPress={() => this.navigateNextScreen('archive')}
                    />
                    <SettingsItem
                        key='app'
                        text='App Settings'
                        onPress={() => this.navigateNextScreen()}
                    />
            </ScrollView >
        )
    }

    navigateNextScreen = (screen) => {
        const { navigate } = this.props.navigation;
        if (screen === 'profile') {
            navigate('ProviderProfileScreen', {navigation: this.props.navigation});
        }
        else if ( screen === 'consultancy'){
            navigate('ProviderConsultancySettingsScreen', {navigation: this.props.navigation});
        }
        else if ( screen ==='archive') {
            navigate('ProviderArchiveScreen', {navigation: this.props.navigation});
        }
    }
}

export default ProviderSettingsScreen