import React, {Component} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {theme} from '../../config/styles';

const Splash = props => {
  return (
    <View style={{flex: 1}}>
      <Text>
        Covids <Text style={{color: theme.colors.primary}}>Near Me</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.font.title,
    color: theme.colors.secondary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Splash;
