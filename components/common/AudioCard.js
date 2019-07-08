import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { PlayIcon, PauseIcon } from './Icons';
import { ProgressBar } from './ProgressBar';
import { PauseButton, PlayButton } from './Buttons';
import Sound from "react-native-sound";
import * as actions from '../../appstate/actions/chat_actions';
import { connect } from 'react-redux';

class AudioCard extends Component {

    state = {
        // sound 
        seconds: -1,
        minutes: 0,
        tmpCurrentDurMins: 0,
        tmpCurrentDurSecs: 0
    }

    timer;

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
            var durationMins = parseInt(duration / 60);
            var durationSecs = parseInt(duration % 60);
            if (durationSecs < 10) {
                durationSecs = '0' + durationSecs
            }
            if (!error) {
                this.setState({
                    sound: sound,
                    createdAt: dateh + ':' + datem,
                    tmpCurrentDurMins: durationMins,
                    tmpCurrentDurSecs: durationSecs,
                    totalMins: durationMins,
                    totalSecs: durationSecs,
                })
            }
        })
    }

    render() {
        return (
            <View style={{
                flexDirection: "row",
                backgroundColor: 'rgb(220,220,220)',
                height: 60,
                width: "100%",
                borderRadius: 4,
                justifyContent: 'center'
            }}>
                <TouchableHighlight style={{ backgroundColor: 'transparent', flex: 1, alignItems: "center" }}>
                    <View style={{ justifyContent: 'center', flex: 1 }}>
                        {this.renderPlayPause()}
                    </View>
                </TouchableHighlight>
                <View style={{
                    flex: 5,
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <View style={{ flex: 2, }}>
                        <ProgressBar
                            style={{ marginLeft: 4, position: 'absolute', bottom: 0 }}
                            duration={this.state.totalMins * 60 + this.state.totalSecs}
                            currentTime={this.state.tmpCurrentDurMins * 60 + this.state.tmpCurrentDurSecs}
                        />
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }} >
                        <Text style={{ flex: 1, marginLeft: 4, alignSelf: 'flex-start', fontSize: 12 }}>{this.state.tmpCurrentDurMins}:{this.state.tmpCurrentDurSecs}</Text>
                        <Text style={{ flex: 1, alignSelf: 'flex-end', fontSize: 12 }}>{this.state.createdAt}</Text>
                    </View>
                </View>
            </View>
        );
    }

    renderPlayPause = () => {
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
        this.props.setAudio(this.props.id);

        const sound = this.state.sound;
        if (sound) {
            this.timer = setInterval(this.incrementTimer, 1000);
            sound.play(success = () => {
                clearInterval(this.timer);
                this.setState({
                    seconds: 0,
                    minutes: 0,
                    tmpCurrentDurMins: this.state.totalMins,
                    tmpCurrentDurSecs: this.state.totalSecs
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
            minutes++;
        }
        var tmpSeconds = seconds;
        var tmpMinutes = minutes;
        if (seconds < 10) {
            tmpSeconds = '0' + seconds;
        }
        console.log(seconds)
            this.setState({
                tmpCurrentDurMins: tmpMinutes,
                tmpCurrentDurSecs: tmpSeconds,
                seconds: seconds,
                minutes: minutes
            })
    }

    stopPlaying = () => {
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
