import React, { Component } from 'react';
import { ScrollView, ActivityIndicator, AsyncStorage, View } from 'react-native'
import * as actions from '../appstate/actions';
import { connect } from 'react-redux';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { ListItem, Button } from 'react-native-elements';
import firebase from 'react-native-firebase';

class ProviderChatSettingsScreen extends Component {
    static navigationOptions = {
        title: 'Konsultasyon fiyat ayarları',
        headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    }

    state = {
        caregivers:[],
        generalFee: 0,
        noOfCaregivers: 0,
        saveButtonText: 'Kaydet',
        disabled: true,
        loading: true
    }

    fetchChatSettings = async () => {
        const { uid } = firebase.auth().currentUser;
        var caregiversData = '';
        try {
            caregiversData = await AsyncStorage.getItem(uid + '/chatSettings/caregivers');
            generalFee = await AsyncStorage.getItem(uid + '/chatSettings/generalFee');
        } catch (error) {
            console.log(error)
        }
        if (caregiversData) {
            let caregivers = await JSON.parse(caregiversData);
            this.setState({
                caregivers: caregivers,
                loading: false,
            })
        } else {
            await this.props.fetchGeneralFee((generalFee) => {
                console.log("General fee", generalFee)
                this.setState({
                    generalFee: generalFee,
                })
            })
            await this.props.fetchChatSettings((caregiver) => {
                const { caregivers, noOfCaregivers } = this.state;
                console.log("New c", caregiver);
                if (!caregiver.fee)
                    caregiver.generalFee = this.state.generalFee;
                caregivers[noOfCaregivers] = caregiver;
                this.setState({
                    caregivers: caregivers,
                    noOfCaregivers: noOfCaregivers + 1
                })
                this.setState({
                    loading: false,
                })
            })
        }
    }

    componentDidMount() {
        this.fetchChatSettings();
    }

    renderChat = ({ item }) => {
        const caregiver = this.state.caregivers[item];
        console.log("Item", item)
        var { displayName, photoUrl, fee } = caregiver;
        if ( !fee)
            fee = caregiver.generalFee
        return (
            <View style={styles.chatItemStyle}>
                <ActivityIndicator size='large' animating={this.state.loading} />
                <ListItem
                    title={displayName}
                    titleStyle={styles.textStyle}
                    input={{ placeholder: 'Ücret', value: fee + "", onChangeText: (newFee) => { this.setNewFee(newFee, item) } }}
                />
            </View>
        );
    }

    setNewFee = (newFee, caregiverIndex) => {
        const caregivers = this.state.caregivers;
        caregivers[caregiverIndex].fee = newFee;
        this.setState({
            caregivers: caregivers,
            disabled: false
        })
    }

    setGeneralFee = (newFee) => {
        this.state.caregivers.forEach(caregiver => {
            if ( caregiver.generalFee)
                caregiver.generalFee = newFee
        })
        this.setState({
            generalFee: newFee,
            disabled: false
        })
    }

    saveChatSettings = async () => {
        this.setState({
            loading: true,
            disabled: true,
            saveButtonText: 'Kaydediliyor'
        })
        await this.props.setChatSettings(this.state.caregivers)
        await this.props.setGeneralFee(this.state.generalFee);
        this.setState({
            loading: false,
            disabled: true,
            saveButtonText: 'Kaydedildi'
        })
        setTimeout(() => {
            this.setState({
                saveButtonText: 'Kaydet'
            })
        }, 2500)
    }

    render() {
        return (
            <ScrollView style={styles.containerStyle}>
                <ListItem
                    title={"Genel Ücret"}
                    titleStyle={styles.textStyle}
                    input={{ placeholder: 'Ücret', value: this.state.generalFee + "", onChangeText: (newFee) => { this.setGeneralFee(newFee) } }}
                />
                <FlatList
                    data={Object.keys(this.state.caregivers)}
                    renderItem={this.renderChat}
                    ListEmptyComponent={this.renderEmptyItem}
                    keyExtractor={(item, index) => index.toString()}
                />
                <Button buttonStyle={{ marginTop: 10 }} title={this.state.saveButtonText} disabled={this.state.disabled} onPress={this.saveChatSettings} />
            </ScrollView>
        );
    }
}

const styles = {
    containerStyle: {
        flex: 1,
        margin: 10
    },
    chatItemStyle: {
        borderBottomColor: 'black',
        borderBottomWidth: 1
    },
    textStyle: {
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18
    },
}

export default connect(null, actions)(ProviderChatSettingsScreen);