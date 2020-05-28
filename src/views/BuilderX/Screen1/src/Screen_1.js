import React, {Component} from 'react';
import {StyleSheet, View, Text, StatusBar} from 'react-native';
import MaterialButtonWithShadow from './components/MaterialButtonWithShadow';
import MaterialCardWithContent from './components/MaterialCardWithContent';
import MaterialHeader3 from './components/MaterialHeader3';
import MaterialIconTextButtonsFooter from './components/MaterialIconTextButtonsFooter';

function Screen1(props) {
  return (
    <View style={styles.container}>
      <View style={styles.materialButtonWithShadowColumn}>
        <MaterialButtonWithShadow
          text1="More"
          style={styles.materialButtonWithShadow}></MaterialButtonWithShadow>
        <MaterialCardWithContent
          style={styles.materialCardWithContent}></MaterialCardWithContent>
        <MaterialHeader3
          text1="Heading"
          style={styles.materialHeader3}></MaterialHeader3>
        <Text style={styles.subHeading}>Sub Heading</Text>
      </View>
      <View style={styles.materialButtonWithShadowColumnFiller}></View>
      <MaterialIconTextButtonsFooter
        style={
          styles.materialIconTextButtonsFooter
        }></MaterialIconTextButtonsFooter>
      <StatusBar animated={false}></StatusBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(35,35,35,1)',
  },
  materialButtonWithShadow: {
    width: 97,
    height: 31,
    backgroundColor: 'rgba(21,21,21,1)',
    elevation: 15,
    borderRadius: 8,
    shadowOffset: {
      height: 2,
      width: 2,
    },
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.51,
    shadowRadius: 5,
    alignSelf: 'flex-end',
    marginTop: 477,
    marginRight: 16,
  },
  materialCardWithContent: {
    height: 346,
    backgroundColor: 'rgba(220,217,217,1)',
    elevation: 36,
    shadowOffset: {
      height: 5,
      width: 2,
    },
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.66,
    shadowRadius: 12,
    marginTop: -392,
    marginLeft: 16,
    marginRight: 16,
  },
  materialHeader3: {
    height: 57,
    marginTop: -462,
  },
  subHeading: {
    color: 'rgba(129,129,129,1)',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 25,
    marginLeft: 16,
  },
  materialButtonWithShadowColumn: {},
  materialButtonWithShadowColumnFiller: {
    flex: 1,
  },
  materialIconTextButtonsFooter: {
    height: 56,
    marginLeft: -7,
  },
});

export default Screen1;
