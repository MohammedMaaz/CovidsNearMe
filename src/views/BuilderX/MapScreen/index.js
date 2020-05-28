import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import MaterialMapView from './components/MaterialMapView';

function Map(props) {
  return (
    <View style={styles.container}>
      <MaterialMapView style={styles.materialMapView}></MaterialMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  materialMapView: {
    width: 334,
    height: 446,
    marginTop: 42,
    marginLeft: 19,
  },
});

export default Map;
