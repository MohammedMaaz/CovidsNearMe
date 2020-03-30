import React, {Component} from 'react';
import {Text, View, StyleSheet, TextInput, Dimensions} from 'react-native';
import {login} from '../../config/actions';
import {Button} from '@ant-design/react-native';
import {connect} from 'dva';
import {theme, Styles} from '../../config/styles';
import {getShadow} from '../../utils/shadow';

class Login extends Component {
  state = {
    phone: '',
  };

  onChangeText = text => {
    this.setState({phone: text});
  };

  render() {
    const {loading, dispatch} = this.props;
    return (
      <View style={Styles.container}>
        <View style={{flex: 1}}>
          <Text style={[Styles.headingText, {textAlign: 'center'}]}>
            Please enter your phone number
          </Text>
          <Text style={[Styles.subHeadingText, {textAlign: 'center'}]}>
            We will send verification code on it
          </Text>
          <View style={styles.inputField}>
            <Text style={styles.input}>+</Text>
            <TextInput
              keyboardType="phone-pad"
              autoFocus={true}
              onChangeText={this.onChangeText}
              style={[styles.input, {width: 160}]}
              placeholder="923231234567"
            />
          </View>
        </View>
        <Button
          style={Styles.button}
          onPress={() => dispatch(login('+' + this.state.phone))}
          loading={loading}
          disabled={loading}>
          <Text style={{color: theme.colors.textLight}}>NEXT</Text>
        </Button>
      </View>
    );
  }
}

export default connect(({auth}) => ({loading: auth.loading}))(Login);

const styles = StyleSheet.create({
  inputField: {
    position: 'absolute',
    top: Dimensions.get('window').height * 0.28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.textLight,
    borderRadius: 8,
    ...getShadow(2),
    paddingLeft: 12,
    paddingRight: 4,
  },
  input: {
    fontSize: theme.font.medium + 2,
    letterSpacing: 1,
  },
});
