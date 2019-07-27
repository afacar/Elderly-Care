import React, { Component } from 'react';
import { View, AsyncStorage, Text, Platform, StyleSheet, TouchableOpacity, Animated, ScrollView, Image } from 'react-native';
import * as actions from '../appstate/actions';
import { connect } from 'react-redux';
import { Card, Input, Button } from 'react-native-elements';
import firebase from 'react-native-firebase';

class CaregiverAnswerScreen extends Component {

    static navigationOptions = {
        title: 'Hasta yanıtları',
        headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    }

    constructor() {
        super();
        this.state = {
            viewArray: [],
            questionArray: [

            ],
            answerArray: [],
            disabled: false,
            exists: false
        }
        this.index = 0;
        this.animatedValue = new Animated.Value(0);
    }

    componentDidMount() {
        const caregiverID = this.props.navigation.getParam('chatId');
        const providerID = firebase.auth().currentUser.uid;

        this.setState({
            caregiverID: caregiverID,
            userId: providerID
        })
        this.fetchAnswers();
    }

    fetchAnswers = async () => {
        const caregiverID = this.props.navigation.getParam('chatId');
        const providerID = firebase.auth().currentUser.uid;
        var exists = false;
        var noQuestion = true;
        var connectionStr = providerID + "/" + caregiverID;
        try {
            exists = await AsyncStorage.getItem(connectionStr + "/exists");
            noQuestion = await AsyncStorage.getItem(connectionStr + "/noQuestion");

        } catch (error) {
            // empty
        }
        if (exists) {
            this.setState({
                exists: true,
                noQuestion: noQuestion
            })
            console.log("No question 1", noQuestion);
            if (noQuestion == 'false') {
                var questionData = await AsyncStorage.getItem(connectionStr + "/questions");
                var answerData = await AsyncStorage.getItem(connectionStr + "/answers");
                var questionArray = await JSON.parse(questionData);
                console.log("Question",questionArray);
                var answerArray = await JSON.parse(answerData);
                for (var i = 0; i < questionArray.length; i++)
                    this.addView(questionArray[i], answerArray[i])
            }
        } else {
            console.log("Answer fetch request");
            const caregiverID = this.props.navigation.getParam('chatId');
            const providerID = firebase.auth().currentUser.uid;
            this.props.fetchDoctorAnswers(providerID, caregiverID, ({ questionArray, answerArray, noQuestion }) => {
                console.log("QA", questionArray + " A", answerArray, "exist ", noQuestion)
                if (questionArray) {
                    this.setState({
                        questionArray: questionArray,
                        answerArray: answerArray,
                        noQuestion: noQuestion
                    })
                    if (!noQuestion) {
                        for (var i = 0; i < questionArray.length; i++)
                            this.addView(questionArray[i], answerArray[i])
                    }
                } else {
                    console.log("Array empty");
                }
            })
        }
    }

    addView = (question, answer) => {
        console.log("Question array add view with index", this.index);
        this.animatedValue.setValue(0);

        let newlyAddedValue = { index: this.index }

        this.setState({ disabled: true, viewArray: [...this.state.viewArray, newlyAddedValue], questionArray: [...this.state.questionArray, question], answerArray: [...this.state.answerArray, answer] }, () => {
            Animated.timing(
                this.animatedValue,
                {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                }
            ).start(() => {
                this.index = this.index + 1;
                this.setState({ disabled: false });
            });
        });
    }

    render() {
        console.log("Render starts");
        const animationValue = this.animatedValue.interpolate(
            {
                inputRange: [0, 1],
                outputRange: [-59, 0]
            });

        let newArray = this.state.viewArray.map((item, key) => {
            if ((key) == this.index) {
                console.log("Inside Render key is index");
                return (
                    <Animated.View key={key} style={[styles.viewHolder, { opacity: this.animatedValue, transform: [{ translateY: animationValue }] }]}>
                        <Input
                            label={`Soru ${item.index + 1}`}
                            value={this.state.questionArray[item.index]}
                            editable={false}
                        />
                        <Input
                            label={`Cevap ${item.index + 1}`}
                            value={this.state.answerArray[item.index]}
                            editable={false}
                        />
                    </Animated.View>
                );
            }
            else {
                console.log("Inside Render key is not index");
                return (
                    <View key={key} style={styles.viewHolder}>
                        <Input
                            label={`Soru ${item.index + 1}`}
                            value={this.state.questionArray[item.index]}
                            editable={false}
                        />
                        <Input
                            label={`Cevap ${item.index + 1}`}
                            value={this.state.answerArray[item.index]}
                            editable={false}
                        />
                    </View>
                );
            }
        });

        console.log("Final Render");
        if (this.state.noQuestion == 'false' || !this.state.noQuestion) {
            return (
                <View style={styles.container}>
                    <ScrollView>
                        <View style={{ flex: 1, padding: 4 }}>
                            {
                                newArray
                            }
                        </View>
                    </ScrollView>
                </View>
            );
        } else {
            return (
                <View>
                    <Text>Ön hazırlık sorularını doldurmadınız!</Text>
                </View>
            )
        }
    }

    componentWillUnmount() {
        this.save_answers();
    }

    save_answers = async () => {
        const { caregiverID, questionArray, answerArray, noQuestion, exists, userId } = this.state;
        console.log("No question 2", noQuestion);
        console.log("No question 3", noQuestion.toString());
        // There is duplication problem in question array. This is a temporary solution.
        var questionArray1 = [];
        for ( var i = 0; i < questionArray.length / 2; i++){
            questionArray1[i] = questionArray[i];
        }
        console.log("Questions 2", questionArray);
        if (!exists) {
            var questionData = await JSON.stringify(questionArray1);
            var answerData = await JSON.stringify(answerArray);
            var connectionStr = userId + "/" + caregiverID;
            AsyncStorage.setItem(connectionStr + "/questions", questionData);
            AsyncStorage.setItem(connectionStr + '/answers', answerData);
            AsyncStorage.setItem(connectionStr + "/noQuestion", noQuestion.toString());
            AsyncStorage.setItem(connectionStr + "/exists", exists.toString());
        }
    }
}

const styles = StyleSheet.create(
    {
        container:
        {
            flex: 1,
            backgroundColor: '#eee',
            justifyContent: 'center',
            paddingTop: (Platform.OS == 'ios') ? 20 : 0
        },

        viewHolder:
        {
            flex: 1,
            flexDirection: 'column',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 40
        },

        text:
        {
            color: 'white',
            fontSize: 25
        },

        btn:
        {
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#51A0D5',
            padding: 15
        },

        btnImage:
        {
            resizeMode: 'contain',
            width: '100%',
            tintColor: 'white'
        }
    });
export default connect(null, actions)(CaregiverAnswerScreen);