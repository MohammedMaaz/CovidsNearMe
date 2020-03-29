import {Alert} from 'react-native';

const AlertPopup = ({
  title = 'Alert',
  message,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'cancel',
  cancelable = false,
}) => {
  Alert.alert(
    title,
    message,
    [
      {text: cancelText, onPress: onCancel, style: 'cancel'},
      {text: okText, onPress: onOk},
    ],
    {cancelable},
  );
};

export default AlertPopup;
