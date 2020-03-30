import {StyleSheet} from 'react-native';

export const theme = {
  colors: {
    primary: '#504889',
    secondary: '#E40B35',
    bgLight: '#E5E4FD',
    textDark: '#333',
    textLight: '#fafafa',
  },

  font: {
    small: 12,
    medium: 18,
    large: 24,
    h2: 28,
    h1: 36,
    title: 44,
  },
};

export const Styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    width: '100%',
    height: 50,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: theme.colors.bgLight,
  },
  headingText: {
    color: theme.colors.textDark,
    fontWeight: 'bold',
    fontSize: theme.font.large,
  },
  subHeadingText: {
    color: theme.colors.textDark,
    fontSize: theme.font.medium,
    marginTop: 6,
  },
  title: {
    fontSize: theme.font.title,
    color: theme.colors.secondary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
