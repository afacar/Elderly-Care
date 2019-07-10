import React, { Component } from 'react';


import { View, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import { Card } from 'react-native-elements';
import { CardItem, TextInput } from '../common';
import firebase from 'react-native-firebase';

class UserProfileForm extends Component {
    state = { profile: {}, loading: true };

    getProfile = async (user) => {
        console.log("User UPF", user._id)
        const url = `users/${user._id}/profile`;
        await firebase.database().ref(url).once('value', async (snapshot) => {
            let profile = snapshot.val();
            console.log("Profile", profile);
            this.setState({
                profile: profile,
                loading: false
            })
        });
    }

    render() {
        if (this.state.loading) {
            this.getProfile(this.props.user);
            return (
                <View style={styles.containerStyle}>
                    <ActivityIndicator size='small' color='red' />
                </View>
            );
        }
        else {
            if (this.state.profile.userRole == 'p') {
                return (
                    <View>
                        {this.renderProvider()}
                    </View>
                )
            }
            else {
                return (
                    <View>
                        {this.renderCaregiver()}
                    </View>
                )
            }
        }
    }

    renderProvider = () => {
        return (
            <Card
                title={this.state.profile.displayName || 'Doktorun isim bilgileri belirtilmedi.'}
                containerStyle={{ margin: 5 }}>
                <TouchableOpacity
                    onPress={this.onImageClicked}>
                    <View>
                        <Image
                            style={{ width: 150, height: 150, alignSelf: 'center', paddingBottom: 25 }}
                            source={ this.state.profile.photoURL ? {uri: this.state.profile.photoURL } : require("../../assets/images/doctor.png") } />
                    </View>
                </TouchableOpacity>

                <CardItem>
                    <TextInput
                        key='displayname'
                        label="Ad soyad"
                        value={this.state.profile.displayName || 'Doktorun isim bilgileri belirtilmedi.'}
                        multiline={true}
                        editable={false} />
                </CardItem>

                <CardItem>
                    <TextInput
                        key='profession'
                        label='Uzmanlık'
                        value={this.state.profile.profession || 'Doktorun uzmanlık alanı belirtilmedi.'}
                        multiline={true}
                        editable={false} />
                </CardItem>

                <CardItem>
                    <TextInput
                        key='biography'
                        label='Biyografi'
                        value={this.state.profile.experience || 'Doktorun tecrübe bilgisi belirtilmedi.'}
                        multiline={true}
                        editable={false} />
                </CardItem>
            </Card>
        );
    }

    renderCaregiver = () => {
        return (
            <Card title={this.state.profile.displayName || "Kullanıcı ismini belirtmedi."}
                containerStyle={styles.containerStyle}>
                <TouchableOpacity
                    onPress={this.onImageClicked}>
                    <View>
                        <Image
                            style={{ width: 150, height: 150, alignSelf: 'center', paddingBottom: 25 }}
                            source={ this.state.profile.photoURL ? {uri: this.state.profile.photoURL } : require("../../assets/images/doctor.png") } />
                    </View>
                </TouchableOpacity>

                <CardItem>
                    <TextInput
                        label="Ad soyad"
                        value={this.state.profile.displayName || "Kullanıcı ismini belirtmedi."}
                        multiline={true}
                        editable={false}
                    />
                </CardItem>
                <CardItem>
                    <TextInput
                        label="E-posta"
                        value={this.state.profile.email || "Kullanıcı e-posta belirtmedi."}
                        multiline={true}
                        editable={false}
                    />
                </CardItem>
                <CardItem>
                    <TextInput
                        label="Telefon"
                        value={this.state.profile.phoneNumber || "Kullanıcı telefon numarasını belirtmedi."}
                        editable={false}
                        multiline={true}
                    />
                </CardItem>
                <CardItem>
                    <TextInput
                        key="profilebirthdate"
                        label="Doğum Tarihi"
                        value={this.state.profile.birthdate || 'Kullanıcı doğum tarihini belirtmedi.'}
                        multiline={true}
                        editable={false}
                    />
                </CardItem>

                <CardItem>
                    <TextInput
                        label='Cinsiyet'
                        value={this.state.profile.gender || 'Kullanıcı cinsiyetini belirtmedi.'}
                        multiline={true}
                        editable={false} />
                </CardItem>

                <CardItem>
                    <TextInput
                        label='Adres'
                        value={this.state.profile.address || 'Kullanıcı adresini belirtmedi.'}
                        multiline={true}
                        editable={false}
                    />
                </CardItem>
            </Card>

        );
    }

    onImageClicked = () => {

    }
}

const styles = {
    containerStyle: {
        flex: 1,
        justifyContent: 'center'
    },
}

export { UserProfileForm };