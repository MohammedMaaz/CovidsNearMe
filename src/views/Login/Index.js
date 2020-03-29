import React, {Component} from 'react';
import {Text, View, StyleSheet, TextInput} from 'react-native';

export default class Login extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text> Please Enter Phone Number </Text>
        <TextInput />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
