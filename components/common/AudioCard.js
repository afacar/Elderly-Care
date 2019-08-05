import React, { Component } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { PlayIcon, PauseIcon } from './Icons';
import { ProgressBar } from './ProgressBar';
import { PauseButton, PlayButton, ResetButton } from './Buttons';
import Sound from "react-native-sound";
import * as actions from '../../appstate/actions/chat_actions';
import { connect } from 'react-redux';
import { Icon, Button } from 'react-native-elements';

class AudioCard extends Component {

    state = {
        // sound 
        seconds: -1,
        minutes: 0,
        currentDuration: 0,
        loading: true,
        paused: false,
        playing: false,
        duration: "",
        sound: ''
    }

    timer;
    is_mounted = false;

    componentDidMount() {
        this.is_mounted = true;
    }
    constructor(props) {
        super(props);
        const date = new Date(this.props.createdAt);
        const dateh = date.getHours();
        var datem = date.getMinutes();
        if (datem < 10) {
            datem = '0' + datem
        }
        const sound = new Sound(this.props.audio, "", error => {
            var duration = sound.getDuration();
            if (!error) {
                if (this.is_mounted) {
                    this.setState({
                        sound: sound,
                        createdAt: dateh + ':' + datem,
                        duration: duration + 2,
                        loading: false
                    })
                }
            }
            else {
                console.log("Hata var", this.props.audio);
            }
        })
    }

    render() {
        if (this.state.loading)
            return (
                <View style={{
                    flexDirection: "row",
                    backgroundColor: 'rgb(220,220,220)',
                    height: 60,
                    width: "100%",
                    borderRadius: 4,
                    justifyContent: 'center',
                    padding: 8
                }}>
                    <ActivityIndicator size="small" color='#2fb4dc' />
                </View>
            )
        else {
            return (
                <View style={{
                    flexDirection: "row",
                    backgroundColor: 'rgb(220,220,220)',
                    height: Platform.OS == 'ios' ? 80 : 60,
                    width: "100%",
                    borderRadius: 4,
                    justifyContent: 'center',
                    padding: 8
                }}>
                    <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: "center" }}>
                        <View style={{ justifyContent: 'center', flex: 1 }}>
                            {this.renderPlayPause()}
                        </View>
                    </View>
                    <View style={{
                        flex: 5,
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}>
                        <View style={{ flex: Platform.OS == 'ios' ? 4 : 9, flexDirection: 'column', justifyContent: Platform.OS == 'ios' ? "flex-end" : 'center' }}>
                            <Slider
                                step={1}
                                minimumValue={0}
                                maximumValue={this.state.duration}
                                value={this.state.currentDuration}
                                minimumTrackTintColor="#2fb4dc"
                                thumbTintColor='#2fb4dc'
                                onValueChange={(ChangedValue) => { this.SliderValueChanged(ChangedValue) }}
                                style={{ marginLeft: 4, alignSelf: 'flex-end', width: '100%' }}
                            />
                            {/* <ProgressBar
                                style={{ marginLeft: 4, alignSelf: 'flex-end' }}
                                duration={this.state.totalMins * 60 + this.state.totalSecs}
                                currentTime={this.state.tmpCurrentDurMins * 60 + this.state.tmpCurrentDurSecs}
                            /> */}
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }} >
                            <Text style={{ flex: 1, marginLeft: 4, alignSelf: 'center', fontSize: 12 }}>{this.getPlayTimeText()}</Text>
                            <Text style={{ flex: 1, alignSelf: 'center', fontSize: 12 }}>{this.state.createdAt}</Text>
                        </View>
                    </View>
                </View>
            );
        }
    }

    SliderValueChanged = (ChangedValue) => {
        if (this.is_mounted) {
            this.setState({ currentDuration: ChangedValue });
        }
        this.state.sound.setCurrentTime(ChangedValue);
    }

    getPlayTimeText = () => {
        const { paused, duration, currentDuration, playing } = this.state;
        let mins = '';
        let secs = '';
        if (paused || playing) {
            mins = parseInt(currentDuration / 60);
            secs = parseInt(currentDuration % 60);
        } else {
            mins = parseInt(duration / 60);
            secs = parseInt(duration % 60);
        }
        if (secs < 10)
            secs = '0' + secs;
        return mins + ":" + secs;
    }

    // resetSound = () => {
    //     console.log("Reset Sound");
    //     this.props.setAudio("");
    //     const sound = this.state.sound;
    //     if (sound) {
    //         sound.stop();
    //         if (this.timer)
    //             clearInterval(this.timer);
    //         this.setState({
    //             seconds: 0,
    //             minutes: 0,
    //             paused: false,
    //             playing: false,
    //             currentDuration: 0
    //         })
    //     }
    // }

    renderPlayPause = () => {
        console.log("Here");
        if (this.props.currentAudio) {
            if (this.props.currentAudio.id === this.props.id) {
                return <PauseButton onPress={this.stopPlaying} />
            } else {
                const sound = this.state.sound;
                if (sound) {
                    sound.pause();
                    if (this.timer)
                        clearInterval(this.timer);
                }
                return <PlayButton onPress={this.startPlaying} />
            }
        }
        else
            return <PlayButton onPress={this.startPlaying} />
    }


    startPlaying = () => {
        console.log("Here 1");
        this.props.setAudio(this.props.id);
        if (this.is_mounted) {
            this.setState({
                playing: true
            })
        }
        const sound = this.state.sound;
        if (sound) {
            this.timer = setInterval(this.incrementTimer, 1000);
            sound.play(success = () => {
                clearInterval(this.timer);
                this.setState({
                    seconds: 0,
                    minutes: 0,
                    paused: false,
                    playing: false,
                    currentDuration: 0
                })
                this.props.setAudio("");
            })
        }
    }

    incrementTimer = () => {
        var { seconds, minutes } = this.state;
        seconds += 1;
        if (seconds >= 60) {
            seconds = 0;
            minutes += seconds / 60;
        }
        if (seconds < 10) {
            tmpSeconds = '0' + seconds;
        }
        this.setState({
            currentDuration: this.state.currentDuration + 1,
            seconds: seconds,
            minutes: minutes
        })
    }

    stopPlaying = () => {
        this.setState({
            pause: true,
            playing: false
        })
        this.props.setAudio("");
        const sound = this.state.sound;
        if (sound) {
            sound.pause();
            if (this.timer)
                clearInterval(this.timer);
        }
    }
    styles = {
        containerStyle: {
            flexDirection: "row",
            backgroundColor: 'rgb(220,220,220)',
            height: 60,
            width: "100%",
            borderRadius: 4,
            justifyContent: 'center'
        },
        progressStyle: {
            flex: 5,
            justifyContent: 'center'
        }
    }
}
const mapStateToProps = ({ chat }) => {
    return { currentAudio: chat.currentAudio };
}
export default connect(mapStateToProps, actions)(AudioCard);