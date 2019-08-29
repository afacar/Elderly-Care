import React, { Component } from 'react';
import { AsyncStorage, View, Text, Platform, StyleSheet, TouchableOpacity, Animated, ScrollView, Image } from 'react-native';
import { Card, Input, Button } from 'react-native-elements';
import { CardItem, CameraButton } from '../components/common';
import * as actions from '../appstate/actions';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import firebase from 'react-native-firebase';

class ProviderPQScreen extends Component {

    static navigationOptions = {
        title: 'Ön sorular'
    }


    constructor() {
        super();

        this.state = {
            viewArray: [],
            questionArray: [
                /*{
                    question1
                },
                {
                    question2
                }*/
            ],
            disabled: false,
            exists: false,
        }

        this.index = 0;

        this.animatedValue = new Animated.Value(0);
    }

    componentDidMount() {
        this.fetchQuestions();

    }

    fetchQuestions = async () => {

        const providerID = firebase.auth().currentUser.uid;
        var exists = false;

        var localURL = providerID + '/questions';

        try {
            exists = await AsyncStorage.getItem(providerID + "/exists" );
        } catch (error) {
            // empty
        }
        if (exists == 'true') {
            this.setState({
                exists: true
            })
            var questionData = await AsyncStorage.getItem(localURL);
            var questionArray = await JSON.parse(questionData);
            console.log("Question", questionArray);
            this.setState({
                questionArray: questionArray
            })
            for (var i = 0; i < questionArray.length; i++)
                this.addView()
        } else {
            console.log("Get Question array");
            await this.props.fetchQuestions((questionArray) => {
                console.log("All questions", questionArray);
                if (questionArray) {
                    this.setState({
                        questionArray: questionArray
                    })
                    console.log("Question array size", questionArray.length);
                    for (var i = 0; i < questionArray.length; i++) {
                        this.addView();
                    }
                } else {
                    console.log("Array empty");
                }
            });
        }
    }
    addView = () => {
        console.log("Question array add view with index", this.index);
        this.animatedValue.setValue(0);

        let newlyAddedValue = { index: this.index }

        this.setState({ disabled: true, viewArray: [...this.state.viewArray, newlyAddedValue], questionArray: [...this.state.questionArray, ""] }, () => {
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

    addQuestion = (index, text) => {
        var questionArray = this.state.questionArray;
        questionArray[index] = text;
        this.setState({
            questionArray: questionArray
        })
    }

    removeQuestion = (index) => {
        console.log("Remove question with index ", index)
        var viewArray = this.state.viewArray;
        var questionArray = this.state.questionArray;
        for (var i = 0; i < viewArray.length; i++) {
            console.log("Array item ", viewArray[i])
            if (viewArray[i].index == index) {
                viewArray.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < viewArray.length; i++) {
            viewArray[i].index = i;
        }
        this.index = this.index - 1;
        this.setState({
            viewArray: viewArray
        })
        console.log("Question array before deletion", questionArray)
        questionArray.splice(index, 1)
        console.log("Question array after deletion", questionArray)
        this.setState({
            questionArray: questionArray
        })
    }

    componentWillUnmount() {
        console.log("Questions, ", this.state.questionArray);
        var questionArray = [];
        var index = 0;
        for (var i = 0; i < this.state.questionArray.length; i++) {
            if (this.state.questionArray[i] !== "") {
                questionArray[index] = this.state.questionArray[i];
                index++;
            }
        }
        this.saveQuestions(questionArray);
        this.props.saveQuestions(questionArray);
    }

    saveQuestions = async(questionArray) =>{
        const {exists} = this.state;
        const providerID = firebase.auth().currentUser.uid;
        const localURL = providerID + "/questions";
        if( !exists){
            var questionData = await JSON.stringify(questionArray);
            AsyncStorage.setItem(localURL, questionData);
            AsyncStorage.setItem(providerID + "/exists", exists.toString());
        }
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
                            placeholder='Sorunuzu girin...'
                            onChangeText={(text) => this.addQuestion(item.index, text)}
                        />
                        <View style={{ flexDirection: 'column', justifyContent: 'space-evenly', height: '100%' }}>
                        <TouchableOpacity onPress={() => this.removeQuestion(item.index)}>
                            <Icon type='font-awesome' name='plus-circle' style={styles.btn} size={36} color='red' />
                        </TouchableOpacity>
                            {/* <Button buttonStyle={{backgroundColor: '#51A0D5', padding: 10}} title="Düzenle" /> */}
                        </View>
                    </Animated.View>
                );
            }
            else {
                console.log("Inside Render key is not index");
                return (
                    <Card key={key} style={styles.viewHolder}>
                        <Input
                            label={`Soru ${item.index + 1}`}
                            placeholder='Sorunuzu girin...'
                            value={this.state.questionArray[item.index]}
                            onChangeText={(text) => this.addQuestion(item.index, text)}
                        />
                    
                    
                        <TouchableOpacity onPress={() => this.removeQuestion(item.index)}>
                            <Icon type='font-awesome' name='minus-circle' paddingTop={15} style={styles.btn} size={30} color='red'  />
                        </TouchableOpacity>
                
                            {/* <Button buttonStyle={{ backgroundColor: '#51A0D5', padding: 10}} title="Düzenle"/> */}
                        
                    </Card>
                );
            }
        });

        console.log("Final Render");
        return (
            <View style={styles.container}>
                <ScrollView>
                    <View style={{ flex: 1, padding: 4 }}>
                        {
                            newArray
                        }
                         
                    </View>                   
                </ScrollView>
                <TouchableOpacity onPress={this.addView}>
                            <Icon  type='font-awesome' name='plus-circle' style={styles.btn} size={45} color='red' />
                        </TouchableOpacity>
            </View>
        );
    }
}


const styles = StyleSheet.create(
    {
        container:
        {
            flex: 1,
            backgroundColor: '#f7f7f7',
            justifyContent: 'center',
            paddingTop: (Platform.OS == 'ios') ? 20 : 0
        },

        viewHolder:
        {
            flex: 1,
            flexDirection: 'row',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 18
        },

        text:
        {
            color: 'white',
            fontSize: 20
        },

        btn:
        {
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#51A0D5',
            padding: 25,

        },

        btnImage:
        {
            resizeMode: 'contain',
            width: '100%',
            tintColor: 'white'
        }
    });
export default connect(null, actions)(ProviderPQScreen);