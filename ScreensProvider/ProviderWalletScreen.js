import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SettingsItem } from '../components/common/Items';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { TextInput, CardItem, SaveButton } from '../components/common';
import { Card, Input } from 'react-native-elements';
import * as actions from '../appstate/actions/common_actions'
import {connect} from 'react-redux'

class ProviderWalletScreen extends Component {
    static navigationOptions = {
        title: 'My Wallet',
    };


    getIBAN = () => {
        this.props.getIBAN( (IBAN) => {
            this.setState({
                IBAN: IBAN
            })
        })
    } 

    state = {
        IBAN: "",
    }
    async componentDidMount () {
        this.props.getIBAN( (IBAN) => {
            console.log(IBAN);
            this.setState({
                IBAN:IBAN
            })
        });
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
                            value="0₺"
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
                                    IBAN: text
                                })
                            }}
                            editable={true} />
                    </CardItem>
                </Card>
                <CardItem>
                    <SaveButton onPress={() => {
                        this.props.setIBAN(this.state.IBAN)
                    }} />
                </CardItem>
            </View>
        )
    }

    async componentWillUnmount() {
        this.props.setIBAN(this.state.IBAN);
    }
}

export default connect(null, actions)(ProviderWalletScreen);