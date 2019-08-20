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
        title: 'My Wallet',
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
            if (this.isMounted && balance)
                this.setState({
                    balance: balance,
                })
        })
    }

    saveChatSettings = async () => {
        if (this.isMounted)
            this.setState({
                disabled: true,
                saveButtonText: 'Kaydediliyor',
                loading: true
            })

        await this.props.setIBAN(this.state.IBAN);
        if (this.isMounted)
            this.setState({
                saveButtonText: 'Kaydedildi',
                loading: false
            })
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Card
                    containerStyle={{ margin: 5 }}>
                    <CardItem>
                        <Input
                            key='balance'
                            label="Balance"
                            value={this.state.balance + "₺"}
                            multiline={false}
                            editable={false} />
                    </CardItem>

                    <CardItem>
                        <Input
                            key='iban'
                            label='IBAN'
                            value={this.state.IBAN ? this.state.IBAN : ""}
                            placeholder={'TR012345678901234567890123456.'}
                            multiline={false}
                            onChangeText={(text) => {
                                this.setState({
                                    disabled: false,
                                    saveButtonText: 'Kaydet',
                                    IBAN: text
                                })
                            }}
                            editable={true} />
                    </CardItem>
                </Card>
                <CardItem>
                    <SaveButton title={this.state.loading ? 'Kaydediliyor' : this.state.saveButtonText} disabled={this.state.disabled} onPress={this.saveChatSettings} />
                </CardItem>
            </View>
        )
    }

    async componentWillUnmount() {
        this.isMounted = false;
        this.props.setIBAN(this.state.IBAN);
    }
}

export default connect(null, actions)(ProviderWalletScreen);