import React from 'react';
import { AsyncStorage, TouchableOpacity, Text, View, Image, Platform, Modal, BackHandler } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { Composer, GiftedChat, Send, Bubble } from 'react-native-gifted-chat';
import { connect } from 'react-redux';
import * as actions from '../appstate/actions';
import "moment/locale/tr";

import CircleTransition from 'react-native-circle-reveal-view';
import { AudioUtils, AudioRecorder } from 'react-native-audio';
import { PermissionsAndroid } from 'react-native';
import AudioCard from '../components/common/AudioCard';
import Sound from "react-native-sound";

import { ImageButton, AttachmentButton, CameraButton, MicButton, CancelButton } from '../components/common/Buttons.js'
import ImagePicker from 'react-native-image-picker';

import firebase from 'react-native-firebase';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MODAL } from '../appstate/actions/types';

var RNFS = require('react-native-fs');

class ProviderMessageScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.getParam('title', '')}`,
        headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
        headerStyle: {
            backgroundColor: 'white',
        },
        // headerRight: (
        // <View>
        // <TouchableOpacity onPress={() => navigation.navigate('PatientScreen', {
        // userid: navigation.getParam('userid', '')
        // })}>
        // <View style={{ alignSelf: 'flex-end', alignItems: 'center', marginRight: 10 }}>
        // <Image
        // style={{ width: 40, height: 40 }}
        // source={require('../assets/images/patient.png')}
        // />
        // <Text style={{ fontWeight: 'bold' }}>Hasta Bilgisi</Text>
        // </View>
        // </TouchableOpacity>
        // </View>
        // <View style={{ flex: 1 }}>
        // {() => this.renderArchive(isArchived)}
        // </View>
        // )
        headerRight: (
            <Button
                onPress={() => navigation.navigate('CaregiverAnswerScreen', {
                    chatId: navigation.getParam('chatId')
                })}
                title="Hasta Yanıtları"
                titleStyle={{ color: 'black', fontSize: 12 }}
                color='transparent'
                buttonStyle={{ backgroundColor: 'transparent' }}
                icon={<Icon name='info' type='material' size={30} color='#51A0D5' />} />
        ),
    });

    renderArchive = (isArchived) => {
        if (isArchived) {
            return (
                <View>
                    <CameraButton />
                    <Text>Arşivden Çıkar</Text>
                </View>
            )
        } else {
            return (
                <View>
                    <MicButton />
                    <Text>Arşivden Çıkar</Text>
                </View>
            )
        }
    }


    _isMounted = null;

    cameraOptions = {
        title: 'Fotoğraf Seç',
        storageOptions: {
            skipBackup: true,
            path: 'images',
            allowsEditing: true,
        },
    };

    state = {
        messages: [],
        images: [],
        imageIndex: 1,
        showImage: false,
        isNewMessage: false,
        chatId: null,
        userRole: null,
        isApproved: true,
        userIsTyping: false,
        hasPermission: false,
        startAudio: false,
        audioPlaying: false,
        fetchChats: false,
        audioSettings: {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "High",
            AudioEncoding: "aac",
            MateringEnabled: true,
            IncludeBase64: true,
            AudioEncodingBitRate: 32000
        },
        showAnswers: false
    };

    // More info on all the options is below in the API Reference... just some common use cases shown here
    cameraOptions = {
        title: 'Fotoğraf Seç',
        storageOptions: {
            skipBackup: true,
            path: 'images',
            allowsEditing: true,
        },
    };

    changeTypeState = (text) => {
        var typing = false;
        if (text) {
            typing = true;
        }
        this.setState({
            userIsTyping: typing
        })
    }

    openImage = (index) => {
        console.log("Images", this.state.images);
        this.setState({
            showImage: true,
            currentIndex: index
        })
    }

    renderMessageImage = (props) => {
        const images = [{
            // Simplest usage.
            url: props.currentMessage.image,
            // You can pass props to <Image />.
        }];
        return (
            <TouchableOpacity onPress={() => this.openImage(props.currentMessage.index)}>
                <Image
                    source={{ uri: props.currentMessage.image }}
                    style={styles.image}
                />
            </TouchableOpacity>
        );
    }

    render() {
        const { chatId, userRole, messages, isApproved } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <GiftedChat
                    key={chatId}
                    messages={messages}
                    locale='tr'
                    onSend={(message) => {
                        // TODO: Before sending message to server
                        // Add message to local state
                        /* this.setState(previousState => ({
                        messages: GiftedChat.append(previousState.messages, messages),
                        })) */
                        this.sendMessage(message);
                    }}
                    onInputTextChanged={(text) => { this.changeTypeState(text) }}
                    renderInputToolbar={isApproved === 'pause' ? () => null : undefined}
                    showUserAvatar={false}
                    user={{
                        _id: this.props.getUid(),
                        name: this.props.getName(),
                        avatar: this.props.getPhotoURL(),
                    }}
                    placeholder='Mesaj yazın...'
                    renderSend={this._renderSend}
                    renderBubble={this.renderBubble}
                    renderActions={this.renderActions}
                    onPressAvatar={this.onPressAvatar}
                    renderMessageImage={this.renderMessageImage}
                />
                <Modal
                    visible={this.state.showImage}
                    transparent={true}
                >
                    <ImageViewer
                        imageUrls={this.state.images}
                        onSwipeDown={() => this.setState({ showImage: false })}
                        enableSwipeDown={true}
                        index={this.state.currentIndex - 1}
                    />
                </Modal>
                <Modal
                    visible={this.state.showAnswers}
                    transparent={true}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <Text style={{ alignSelf: 'center' }}>{this.state.QA}</Text>
                        <Button title='Kapat' buttonStyle={{ alignSelf: 'center', backgroundColor: '#51A0D5' }} onPress={() => { this.setState({ showAnswers: false }) }} />
                    </View>
                </Modal>
            </View>
        );
    }

    onPressAvatar = (props) => {
        /*
        props = user { _id, name, avatar}
        */
        console.log("User PMS", props);
        const { navigate } = this.props.navigation;
        navigate('UserProfileScreen', { user: props });
    }

    renderAudio = (props) => {
        return !props.currentMessage.audio ? (
            <View />
        ) : (
                <AudioCard
                    id={props.currentMessage._id}
                    audio={props.currentMessage.audio}
                    createdAt={props.currentMessage.createdAt}
                />
            );
    };

    renderBubble = props => {
        if (props.currentMessage.audio) {
            return (
                <View>
                    {this.renderAudio(props)}
                </View>
            )
        } else {
            return (
                <View>
                    <Bubble {...props} />
                </View>
            );
        }
    };

    renderActions = props => {
        if (!this.state.userIsTyping) {
            return (
                <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }}>
                    {/* <View style={{ flex: 1, alignItems: 'center' }}>
 <AttachmentButton onPress={() => { this.transitedView.toggle() }} />

 <CircleTransition
 ref={(ref) => this.transitedView = ref}
 backgroundColor={'#EEEBE9'}
 duration={100}
 style={{ position: 'absolute', bottom: 48, right: 8, left: 8, width: '1000%', borderRadius: 8 }}
 revealPositionArray={{ bottom: true, left: true }}// must use less than two combination e.g bottom and left or top right or right
 >
 <View style={{ flexDirection: 'row', flex: 1 }}>
 <View style={{ flex: 1 }}>
 </View>
 <View style={{ flex: 1 }}>
 </View>
 <View style={{ flex: 1 }}>
 <TouchableOpacity onPress={this.openGallery}>
 <ImageButton onPress={this.openGallery}/>
 </TouchableOpacity>
 </View>
 </View>
 <View style={{ flexDirection: 'row', flex: 1 }}>
 <View style={{ flex: 1 }}>
 </View>
 <View style={{ flex: 1 }}>
 </View>
 <View style={{ flex: 1 }}>
 <TouchableOpacity onPress={this.openCamera}>
 <CameraButton onPress={this.openCamera}/>
 </TouchableOpacity>
 </View>
 </View>
 </CircleTransition>
 </View> */}
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={this.openPicker}>
                            <CameraButton onPress={this.openPicker} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }} >
                        <TouchableOpacity onPress={this.handleAudio}>
                            <MicButton onPress={this.handleAudio} isListening={this.state.startAudio} />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    openPicker = () => {

        // More info on all the options is below in the API Reference... just some common use cases shown here
        const options = {
            title: 'Fotoğraf Seç',
            storageOptions: {
                skipBackup: true,
                path: 'images',
                allowsEditing: true,
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                const message = {
                    text: "",
                    user: {
                        _id: this.props.getUid(),
                        name: this.props.getName(),
                        avatar: this.props.getPhotoURL(),
                    },
                    image: response.uri.toString(),
                    path: response.path.toString()
                };
                this.sendMessage([message]);
            }
        });
    }

    handleAudio = async () => {

        user = {
            _id: this.props.getUid(),
            name: this.props.getName(),
            avatar: this.props.getPhotoURL(),
        }

        if (!this.state.startAudio) {
            var id = this.randIDGenerator();
            this.setState({
                lastAudioID: id
            })
            this.setState({
                startAudio: true
            });
            const audioPath = `${
                AudioUtils.DocumentDirectoryPath}/${id}.aac`;
            await AudioRecorder.prepareRecordingAtPath(
                audioPath,
                this.state.audioSettings
            );
            await AudioRecorder.startRecording();

        } else {
            this.setState({
                startAudio: false
            })
            var filePath = await AudioRecorder.stopRecording();
            AudioRecorder.onFinished = data => {
                var audioPath = data.audioFileURL;
                console.log("audioPath", audioPath);
                if (Platform.OS == 'ios') {
                    filePath = audioPath
                }
                console.log("FilePath", filePath);
                const message = {
                    text: '',
                    audio: filePath,
                    audioPath: data.audioFileURL,
                    _id: this.state.lastAudioID,
                    image: '',
                    user: {
                        _id: this.props.getUid(),
                        name: this.props.getName(),
                        avatar: this.props.getPhotoURL(),
                    },
                }
                this.sendMessage([message]);
            };
        }
    }

    _renderSend = (props) => {
        return (
            <Send {...props} containerStyle={{ justifyContent: "center" }}>
                <Text style={{ fontSize: 19, color: 'blue', margin: 5 }}>Gönder</Text>
            </Send>
        );
    }

    openCamera = () => {
        ImagePicker.launchCamera(this.cameraOptions, (response) => {
            this.onImageResult(response);
        })
    }

    openGallery = () => {
        ImagePicker.launchImageLibrary(this.cameraOptions, (response) => {
            this.onImageResult(response);
        })
    }

    onImageResult = (response) => {

        this.transitedView.collapse();
        // More info on all the options is below in the API Reference... just some common use cases shown here

        if (response.didCancel) {
        }
        else if (response.error) {
        }
        else if (response.customButton) {
        }
        else {
            // const source = { uri: response.path }
            // this.setState({
            // imageMessageSrc: source
            // });
            const message = {
                text: "",
                user: {
                    _id: this.props.getUid(),
                    name: this.props.getName(),
                    avatar: this.props.getPhotoURL(),
                },
                image: response.uri.toString(),
                path: response.path.toString()
            };
            this.sendMessage([message]);
        }
    }

    sendMessage = async (messages) => {
        let messagesArray = [];
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            message.createdAt = new Date().getTime();
            if (!message._id)
                message._id = this.randIDGenerator();
            if (message.text)
                message._id = this.randIDGenerator();
            await this.updateState(message);
            messagesArray.push(message);
        }
        const { chatId, userRole, } = this.state;
        this.props.sendMessage(userRole, messagesArray, chatId);
    }

    updateState(message) {
        if (message.image) {
            message.index = this.state.imageIndex;
            this.setState((previousState) => {
                const image = {
                    url: message.image,
                }
                return { messages: GiftedChat.append(previousState.messages, message), isNewMessage: true, images: [...this.state.images, image], imageIndex: this.state.imageIndex + 1 };
            });
        } else {
            this.setState((previousState) => {
                return { messages: GiftedChat.append(previousState.messages, message), isNewMessage: true }
            });
        }
    }

    randIDGenerator = () => {
        var date = new Date().getTime().toString();
        var randId = this.props.getUid() + date;
        return (randId);
    }

    // Permission check for microphone access
    checkPermission() {
        if (Platform.OS !== "android") {
            return Promise.resolve(true);
        }
        const rationale = {
            title: "Microphone Permission",
            message:
                "AudioExample needs access to your microphone so you can record audio."
        };
        return PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            rationale
        ).then(result => {
            return result === true || result === PermissionsAndroid.RESULTS.GRANTED;
        });
    }


    async componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this._isMounted = true;
        const userRole = this.props.navigation.getParam('userRole', '');
        const chatId = this.props.navigation.getParam('chatId', '');
        const title = this.props.navigation.getParam('title', '');
        const isApproved = this.props.navigation.getParam('isApproved', '');
        console.log(`MessageScreen Mounted with chatId: ${chatId} and title: ${title}`);
        if (chatId) {
            this.setState({ chatId, title, userRole, isApproved });
            this.load_messages(chatId);
        }
        // preparation for Audio
        this.checkPermission().then(async hasPermission => {
            this.setState({ hasPermission });
            if (!hasPermission) return;

        });
    }

    load_messages = async (chatId) => {
        //const { chatId } = this.state;
        console.log("load_messages is invoked!", chatId);
        /** load previous messages from local */
        let messageData = '';
        try {
            messageData = await AsyncStorage.getItem(chatId);
        } catch (error) {
            console.error(`${chatId} ait local data okunurken data`, error.message);
        }
        if (messageData) {
            let messages = await JSON.parse(messageData);
            console.log("All messages", messages);
            messages.forEach(message => {
                if (message.image) {
                    message.index = this.state.imageIndex;
                    const image = {
                        url: message.image,
                    }
                    this.setState({
                        images: [...this.state.images, image],
                        imageIndex: this.state.imageIndex + 1
                    })
                }
            })
            this._isMounted && this.setState({ messages });
            this._isMounted && this.fetch_messages();
        } else {
            this._isMounted && this.setState({ messages: [] });
            this._isMounted && this.fetch_messages([]);
        }

    }

    fetch_messages = async (localMessageIds) => {
        const { chatId, userRole } = this.state;
        this.props.fetchMessages(userRole, localMessageIds, chatId, (message) => {
            /** @callback */
            var allMessages = this.state.messages;
            var exists = false;
            allMessages.forEach(element => {
                if (element._id === message._id) {
                    console.log("Exists ", element);
                    exists = true;
                    if (message.audio) {
                        var filePath = `${AudioUtils.DocumentDirectoryPath}/${element._id}.aac`;
                        if (Platform.OS == 'ios')
                            filePath = 'file://' + filePath;
                        if (!RNFS.exists(filePath)) {
                            var ref = '';
                            var { _user } = firebase.auth().currentUser;
                            if (chatId === 'commonchat')
                                ref = 'chatFiles/commonchat/audio';
                            else if (userRole === 'p') {
                                ref = `chatFiles/${_user.uid}/${chatId}/audio`;
                            }
                            firebase.storage().ref().child(ref).child(message._id).downloadFile(filePath).then((onResolve, onReject) => {
                                if (onResolve) {
                                    if (RNFS.exists(filePath)) {
                                        console.log("Exists and downloaded");
                                        element.audio = filePath;
                                    }
                                    else {
                                        console.log("Exists but not downloaded");
                                        // could not download file
                                    }
                                }
                                else if (onReject)
                                    console.log("File not found");
                            });
                        }
                        else if (element.audio !== filePath) {
                            element.audio = filePath;
                            console.log("Exists and file path changed", element);
                            this.setState({
                                isNewMessage: true
                            })
                        }
                    }
                }
            });
            if (!exists) {
                console.log(" Not Exists ");
                if (message.audio) {
                    var filePath = `${AudioUtils.DocumentDirectoryPath}/${message._id}.aac`;
                    if (Platform.OS == 'ios')
                        filePath = 'file://' + filePath; var ref = '';
                    var { _user } = firebase.auth().currentUser;
                    if (chatId === 'commonchat')
                        ref = 'chatFiles/commonchat/audio';
                    else if (userRole === 'p') {
                        ref = `chatFiles/${_user.uid}/${chatId}/audio`;
                    }

                    firebase.storage().ref().child(ref).child(message._id).downloadFile(filePath).then((onResolve, onReject) => {
                        if (onResolve) {
                            if (RNFS.exists(filePath)) {
                                message.audio = filePath;
                                console.log(" Not Exists file saved ", message);
                                return { messages: GiftedChat.append(previousState.messages, message), isNewMessage: true };
                            }
                            else {
                                // could not download file
                                console.log(" Not Exists not downloaded");
                            }
                        }
                        else if (onReject)
                            console.log("File not found");
                    })
                        .catch((error) => {
                            console.log("File not found", error);
                        });
                }
                else {
                    console.log("File not an audio");
                }
            }
            if (!exists) {
                this._isMounted && this.setState((previousState) => {
                    console.log("New message", message)
                    if (message.image) {
                        message.index = this.state.imageIndex;
                        const image = {
                            url: message.image,
                        }
                        return { messages: GiftedChat.append(previousState.messages, message), isNewMessage: true, images: [...this.state.images, image], imageIndex: this.state.imageIndex + 1 };
                    }
                    else {
                        return { messages: GiftedChat.append(previousState.messages, message), isNewMessage: true };
                    }
                })
            } else {
                console.log("Messages ", allMessages);
                this.setState({
                    messages: allMessages,
                })
            }
        });
    }

    save_messages = async () => {
        const { chatId, messages, isNewMessage } = this.state;
        /** save previous messages to local */
        if (isNewMessage) {
            let messageData = await JSON.stringify(messages);
            AsyncStorage.setItem(chatId, messageData)
                .then(() => console.log(`Messages of ${chatId} are saved Successfully to local storage`))
                .catch(error => console.error(`${chatId} local saving has Error!`, error.message));
        }
    }

    componentWillUnmount() {
        const { chatId, userRole } = this.state;
        console.log(`Messages of ${chatId} is saving to local storage...`);
        this.save_messages();
        console.log("CommonChat is unmounting...");
        this.props.closeChat(chatId, userRole);
        this.backHandler.remove();
        this._isMounted = false;
    }

    handleBackPress = () => {
        if (this.state.showImage) {
            this.closeImages();
        } else {
            this.props.navigation.goBack();
        }
    }

    closeImages = () => {
        this.setState({
            showImage: false
        })
    }

    fetchAnswers = () => {
        console.log("Answer fetch request");
        const providerID = firebase.auth().currentUser.uid;
        const caregiverID = this.state.chatId;
        this.props.fetchDoctorAnswers(providerID, caregiverID, (QA) => {
            console.log("QA", QA)
            this.setState({
                QA: QA,
                showAnswers: true
            })
        })
    }
}
const styles = {
    image: {
        width: 200,
        height: 200,
        borderRadius: 13,
        margin: 3,
        resizeMode: 'cover',
    },
};
/* function mapStateToProps({ chat, common }) {
 return { message: chat.message, common };
} */

export default connect(null, actions)(ProviderMessageScreen);