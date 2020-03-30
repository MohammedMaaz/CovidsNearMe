import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  TouchableWithoutFeedback,
  View,
  TextInput,
  ViewPropTypes,
  StyleSheet,
  Text,
} from 'react-native';
import {getShadow} from '../../utils/shadow';
import {theme} from '../../config/styles';

/**
 * @augments {Component<Props, State>}
 */
class CodeInput extends Component {
  state = {
    code: '',
  };

  onChangeText = val => {
    const code = val.substr(0, this.props.length);
    this.setState({code});
    if (this.props.onChangeText) this.props.onChangeText(code);
  };

  componentDidUpdate() {
    if (this.state.code.length === this.props.length) this.textInput.blur();
  }

  render() {
    const {length} = this.props;
    const {code} = this.state;
    return (
      <View>
        <TouchableWithoutFeedback
          onPress={() => {
            this.textInput.blur();
            setTimeout(() => {
              this.textInput.focus();
            }, 100);
          }}>
          <View style={[styles.container, this.props.style]}>
            {Array(length)
              .fill(true)
              .map((b, i) => (
                <Text
                  key={i.toString()}
                  style={[
                    styles.textBox,
                    this.props.boxStyle,
                    {marginLeft: i === 0 ? 0 : 10},
                  ]}>
                  {code[i] ? code[i] : ''}
                </Text>
              ))}
          </View>
        </TouchableWithoutFeedback>
        <TextInput
          style={styles.hiddenInput}
          autoFocus
          maxLength={length}
          onChangeText={this.onChangeText}
          keyboardType="phone-pad"
          ref={c => (this.textInput = c)}
        />
      </View>
    );
  }
}

CodeInput.propTypes = {
  length: PropTypes.number.isRequired,
  onChangeText: PropTypes.func,
  style: ViewPropTypes.style,
  boxStyle: ViewPropTypes.style,
};

export default CodeInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  textBox: {
    width: 44,
    height: 54,
    backgroundColor: '#fff',
    textAlignVertical: 'center',
    fontSize: 40,
    textAlign: 'center',
    color: theme.colors.textDark,
    fontWeight: 'bold',
    borderRadius: 8,
    ...getShadow(4),
  },
  hiddenInput: {
    borderWidth: 0,
    opacity: 0,
    height: 2,
    width: 2,
  },
});
