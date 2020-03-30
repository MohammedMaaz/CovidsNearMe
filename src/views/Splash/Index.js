import React, {Component} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {theme, Styles} from '../../config/styles';

const Splash = props => {
  return (
    <View style={styles.container}>
      <Text style={Styles.title}>
        Covids <Text style={{color: theme.colors.primary}}>Near Me</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...Styles.container,
    justifyContent: 'center',
  },
});

export default Splash;
