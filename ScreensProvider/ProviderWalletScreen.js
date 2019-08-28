import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SettingsItem } from '../components/common/Items';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { TextInput, CardItem, SaveButton } from '../components/common';
import { Card, Input } from 'react-native-elements';
import * as actions from '../appstate/actions/common_actions'
import { connect } from 'react-redux'

class ProviderWalletScreen extends Component {
    static navigationOptions = {
        title: 'Cüzdan',
    };

    isMounted = false;
    state = {
        IBAN: "",
        balance: "0",
        saveButtonText: 'Kaydet',
        disabled: true
    }
    componentDidMount() {
        this.isMounted = true;
        this.props.getIBAN((IBAN) => {
            console.log("IBAN", IBAN);
            if (IBAN)
                this.setState({
                    IBAN: IBAN
                })
        });
        this.props.getBalance(balance => {
            if (balance)
                this.setState({
                    balance: balance,
                })
        })
    }

    saveChatSettings = async () => {

        this.setState({
            loading: true,
            disabled: true,
            saveButtonText: 'Kaydedildi',
        })

        await this.props.setIBAN(this.state.IBAN);
        if (this.isMounted)
            this.setState({
                loading: false,
                disabled: false,
                saveButtonText: 'Kaydet',
            })
            setTimeout(() => {
                if (this.isMounted)
                    this.setState({
                        saveButtonText: 'Kaydet'
                    })
            }, 2500)
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
                <Card
                    containerStyle={{ margin: 5 }}>
                    <CardItem>
                        <Input
                            key='balance'
                            label="Bakiye"
                            value={this.state.balance}
                            multiline={false}
                            editable={false}
                            rightIcon={{
                                type:'font-awesome',
                                name:'turkish-lira',
                                size: 18
                            }}/>
                    </CardItem>

                    <CardItem>
                        <Input
                            key='iban'
                            label='IBAN'
                            value={this.state.IBAN ? this.state.IBAN : ""}
                            placeholder={'TR012345678901234567890123456'}
                            multiline={false}
                            onChangeText={(text) => {
                                this.setState({
                                    disabled: false,
                                    saveButtonText: 'Kaydet',
                                    IBAN: text
                                })
                            }}
                            editable={true} 
                            rightIcon={{
                                type:'font-awesome',
                                name:'bank',
                                size: 18
                            }}/>
                    </CardItem>
                </Card>
                <View>
                    <SaveButton buttonStyle={{ marginTop: 10, backgroundColor: '#51A0D5', marginHorizontal: '20%' }} title={this.state.saveButtonText} disabled={this.state.disabled} onPress={this.saveChatSettings} />
                </View>
            </View>
        )
    }

    async componentWillUnmount() {
        this.isMounted = false;
        this.props.setIBAN(this.state.IBAN);
    }
}

export default connect(null, actions)(ProviderWalletScreen);