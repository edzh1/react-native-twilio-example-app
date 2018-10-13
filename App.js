import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, PermissionsAndroid } from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';

export default class App extends Component {
  state = {
    twilioInited: false
  };

  getAuthToken = () => {
    return fetch('http://c2a19b17.ngrok.io/accessToken', { //replace c2a19b17.ngrok.io with your link (from Step 1)
      method: 'get',
    })
      .then(response => response.text())
      .catch((error) => console.error(error));
  }

  getMicrophonePermission = () => {
    const audioPermission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

    return PermissionsAndroid.check(audioPermission).then(async result => {
      if (!result) {
        const granted = await PermissionsAndroid.request(audioPermission, {
          title: 'Microphone Permission',
          message: 'App needs access to you microphone ' + 'so you can talk with other users.',
        });
      }
    });
  }

  initTwilio = async () => {
    const token = await this.getAuthToken();

    if (Platform.OS === 'android') {
      await this.getMicrophonePermission();
    }

    await TwilioVoice.initWithToken(token);

    TwilioVoice.addEventListener('deviceReady', () => {
      this.setState({ twilioInited: true });
    });

    if (Platform.OS === 'ios') { //required for ios
      TwilioVoice.configureCallKit({
        appName: 'ReactNativeTwilioExampleApp',
      });
    }
  };

  makeCall = () => TwilioVoice.connect({ To: 'Alice' });

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.initTwilio()}>
          <View>
              <Text>Init Twilio</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity disabled={!this.state.twilioInited} onPress={() => this.makeCall()}>
          <View>
            <Text>Make call ({this.state.twilioInited ? 'ready' : 'not ready'})</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
