import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import CodeInput from '../../components/CodeInput/Index';
import {connect} from 'dva';
import {Actions} from 'react-native-router-flux';
import {on_back_press} from '../../utils/utils';
import AlertPopup from '../../components/AlertPopup/Index';
import {theme, Styles} from '../../config/styles';
import {verifyCode} from '../../config/actions';
import {Button} from '@ant-design/react-native';

class VerifyCode extends Component {
  state = {
    code: '',
  };

  componentDidMount() {
    this.back = on_back_press(this.onChangeNumber);
  }

  componentWillUnmount() {
    this.back.remove();
  }

  onChangeNumber = () => {
    AlertPopup({
      title: 'Change Number',
      message:
        'Are you sure you want to exit login process and re-enter phone number?',
      onOk: () => Actions.replace('Login'),
    });
  };

  render() {
    const {dispatch, loading, phone} = this.props;

    return (
      <View style={Styles.container}>
        <View style={{flex: 1}}>
          <Text style={[Styles.headingText, {textAlign: 'center'}]}>
            Verify your mobile number
          </Text>
          <Text style={[Styles.subHeadingText, {textAlign: 'center'}]}>
            Enter the pin you have received via SMS on
          </Text>
          <Text
            style={[
              Styles.headingText,
              {fontSize: theme.font.medium + 1, textAlign: 'center'},
            ]}>
            {phone}
          </Text>
          <TouchableOpacity onPress={this.onChangeNumber}>
            <Text style={styles.changeNumber}>change number</Text>
          </TouchableOpacity>
          <View style={styles.inputField}>
            <CodeInput
              length={6}
              onChangeText={code => this.setState({code})}
            />
          </View>
        </View>
        <Button
          style={Styles.button}
          onPress={() => dispatch(verifyCode(this.state.code))}
          loading={loading}
          disabled={loading}>
          <Text style={{color: theme.colors.textLight}}>NEXT</Text>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  changeNumber: {
    color: theme.colors.secondary,
    fontSize: theme.font.medium,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  inputField: {
    position: 'absolute',
    top: Dimensions.get('window').height * 0.3,
    alignSelf: 'center',
  },
});

export default connect(({auth}) => ({
  loading: auth.loading,
  phone: auth.phoneNumber,
}))(VerifyCode);
