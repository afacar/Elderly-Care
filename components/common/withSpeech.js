import React, { Component } from 'react';
import Voice from 'react-native-voice';
import { Translations } from '../../constants/Translations';
import NUMBERS from '../../constants/Numbers';

const withSpeech = (WrappedComponent) => {
  return class HOC extends Component {
    constructor(props) {
      super(props);
      console.log(`withSpeech constructor has state:`, this.state);
      Voice.onSpeechStart = this.onSpeechStart;
      Voice.onSpeechRecognized = this.onSpeechRecognized;
      Voice.onSpeechEnd = this.onSpeechEnd;
      Voice.onSpeechError = this.onSpeechError;
      Voice.onSpeechResults = this.onSpeechResults;
      Voice.onSpeechPartialResults = this.onSpeechPartialResults;
      Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
    }

    state = {
      cType: null,
      listening: false,
      recognized: '',
      pitch: '',
      error: '',
      end: '',
      started: '',
      result: '',
      partialResults: [],
    };

    onSpeechStart = e => {
      console.log('onSpeechStart: ', e);
      this.setState({
        started: '√',
      });
    };

    onSpeechRecognized = e => {
      console.log('onSpeechRecognized: ', e);
      this.setState({
        recognized: '√',
      });
    };

    onSpeechEnd = e => {
      console.log('onSpeechend: ', e);
      this.setState({
        end: '√',
      });
    };

    onSpeechError = e => {
      console.log('onSpeechError key: ', e);
      const errorMessage = Translations[e.error.message] || e.error.message;
      this.setState({
        error: errorMessage,
        listening: false,
      });
    };

    onSpeechResults = async (e) => {
      console.log('onSpeechResults key: ', e);
      if (this.state.cType == 'date') {
        await this.text2Date(e.value);
      } if (this.state.cType == 'glucose' ||
        this.state.cType == 'bpHigh' ||
        this.state.cType == 'bpLow' ||
        this.state.cType == 'pulse' ||
        this.state.cType == 'weight') {
        /** convert text to number */
        await this.text2Number(e.value);
      } else {
        this.setState({
          result: e.value[0],
          listening: false,
        });
      }
    }

    text2Number = async (textList) => {
      console.log("text2Number function!!");
      for (let i = 0; i < textList.length; i++) {
        const text = textList[i].replace(' buçuk', '.5').replace(' nokta ', '.');
        const num = parseFloat(text);
        if (num) {
          console.log(`text: ${text} parsed2Float => num: ${num}`);
          this.setState({ result: num + '', listening: false, error: '' });
          return;
        }
      }
      this.setState({ result: '', listening: false, error: 'Söylediğiniz değer anlaşılmadı! Elle de giriş yapabilirsiniz.' })
    }

    text2Date = async (textList) => {
      console.log("text2Date function!!");
      try {
        let response = await fetch('http://3.122.131.247:3000/parse', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'content-type': 'application/json',
          },
          body: JSON.stringify(
            {
              textList: textList,
            }
          ),
        });
        console.log("text2Date function fetched", response);
        let responseJson = await response.json();
        console.log("text2Date responseJson: ", responseJson);
        if (!response.ok || responseJson.code == 404) {
          this.setState({ error: "Tarih anlaşılmadı." });
          return;
          //throw new Error(response.statusText || "Tarih anlaşılmadı!");
        }

        const result = JSON.stringify(responseJson).replace('"', '').replace('"', '').replace(',', '');
        console.log("responseJson is stringified->", result);
        const formattedDateTime = this.formatDateTime(result);
        console.log("formattedDateTime:", formattedDateTime);
        // create a date time format as "2019-11-02 17:00"
        this.setState({ result: formattedDateTime, listening: false });
      } catch (error) {
        console.error(error);
        this.setState({ error });
      }
    }

    formatDateTime = (result) => {
      const [date, time, am_pm] = result.split(' ');
      const [month, day, year] = date.split('/');
      const formattedDate = year + '-' + month + '-' + day;
      const [hour, min] = time.split(":")
      let fHour = hour;
      if (am_pm == 'PM') fHour = parseInt(hour) + 12;
      if (fHour.length == 1) fHour = '0' + fHour;
      const formattedHour = fHour + ':' + min;
      return formattedDate + ' ' + formattedHour;
    }

    onSpeechPartialResults = e => {
      console.log('onSpeechPartialResults: ', e);
      this.setState({
        partialResults: e.value
      });
    };

    phrases = ["Donefix 10 Mg Tablet", "shwazil", 'Yemek', 'İlaç', 'Doktor', 'Randevu'];

    _startRecognizing = async (cType) => {

      this.setState({
        cType,
        listening: true,
        recognized: '',
        pitch: '',
        error: '',
        started: '',
        result: '',
        partialResults: [],
        end: '',
      });

      try {
        await Voice.start("tr-TR", { speechContexts: { hints: this.phrases } });
      } catch (e) {
        this.setState({
          error: JSON.stringify(e.error),
        });
      }
    };


    _stopRecognizing = async () => {
      try {
        await Voice.stop();
      } catch (e) {
        //eslint-disable-next-line
        console.error(e);
      }
    };

    _cancelRecognizing = async () => {
      try {
        await Voice.cancel();
      } catch (e) {
        //eslint-disable-next-line
        console.error(e);
      }
    };

    _destroyRecognizer = async () => {
      try {
        await Voice.destroy();
      } catch (e) {
        //eslint-disable-next-line
        console.error(e);
      }
      this.setState({
        isListening: false,
        recognized: '',
        pitch: '',
        error: '',
        started: '',
        results: [],
        partialResults: [],
        end: '',
        sDate: '',
        sTime: '',
      });
    };

    render() {
      return (
        <WrappedComponent
          {...this.props}
          speechResult={this.state.result}
          speechError={this.state.error}
          isListening={this.state.listening}
          startListening={this._startRecognizing}
          stopListening={this._stopRecognizing}
          destroyListener={this._destroyRecognizer}
        />
      );
    }

    componentDidMount() {
      // this._startRecognizing();
    }

    componentWillUnmount() {
      Voice.destroy().then(Voice.removeAllListeners);
    }

  }
}

export default withSpeech;