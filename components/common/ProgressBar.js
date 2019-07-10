import React, { Component } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export class ProgressBar extends Component {


    state = {
        progress: 0
    }
    /*
        props = {
            ...
            duration,
            currentTime
        }
    */
    componentWillMount() {
        this.animation = new Animated.Value(this.props.currentTime);
    }

    componentDidUpdate(prevProps, prevState){
        if (prevProps.currentTime !== this.props.currentTime){
            Animated.timing(this.animation, {
                toValue: this.props.currentTime/this.props.duration,
                duration: this.props.currentTime - prevProps.currentTime
            }).start();
        }
    }

    render() {
        const widthInterpolated = this.animation.interpolate({
            inputRange: [0,1],
            outputRange: ["0%", "100%"],
            extrapolate: 'clamp'
        })
        return (
            <View style={{ flex: 1, flexDirection: "row", height: "100%", justifyContent: 'center'}}>
                <View style={{ flex: 1, borderRadius: 4, justifyContent: 'center', flexDirection: 'column' }}>
                    <View style={{backgroundColor: "red"}} />
                    <Animated.View 
                    style={{
                        position: 'relative',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: widthInterpolated,
                        height: '10%',
                        backgroundColor: "blue",
                    }}
                    />
                </View>
            </View>
        );
    }

}

ProgressBar.defaultProps = {
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 4,
    barColor: "blue",
    fillColor: "red",
    duration: 1000,
}

