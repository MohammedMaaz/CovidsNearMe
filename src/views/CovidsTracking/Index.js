import React, {Component} from 'react';
import {Text, View, Button} from 'react-native';
import {Styles} from '../../config/styles';
import LoggingService from '../../services/logging';
import {WhiteSpace} from '@ant-design/react-native';
import {Actions} from 'react-native-router-flux';

export default class CovidsTracking extends Component {
  render() {
    return (
      <View style={Styles.container}>
        <Text style={Styles.title}> Welcome </Text>
        <WhiteSpace size="xl" />
        <Button title="Start Logging" onPress={LoggingService.start} />
        <WhiteSpace size="lg" />
        <Button title="Stop Logging" onPress={LoggingService.stop} />
        <WhiteSpace size="lg" />
        <Button title="Builder X" onPress={() => Actions.BX_screen_1()} />
        <WhiteSpace size="lg" />
        <Button title="Builder X Map" onPress={() => Actions.BX_map_screen()} />
      </View>
    );
  }
}
