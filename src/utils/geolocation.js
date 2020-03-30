import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const getDistance = (lat1, lng1, lat2, lng2) => {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lng2 - lng1) * p))) / 2;

  return 12742000 * Math.asin(Math.sqrt(a));
};

export const checkAndAskPermission = async () => {
  if (
    Platform.OS === 'ios' ||
    (Platform.OS === 'android' && Platform.Version < 23)
  ) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) return true;

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

  return false;
};

export const getLocation = ({
  enableHighAccuracy = true,
  maximumAge = 5000,
  timeout = 8000,
  forceRequestLocation = true,
  useSignificantChanges = false,
  distanceFilter = 0,
  showLocationDialog = true,
}) => {
  return new Promise(async (res, rej) => {
    const hasPermission = await checkAndAskPermission();
    //utils.delay(timeout).then(() => rej('timeout'));
    Geolocation.getCurrentPosition(
      position => res(position),
      error => rej(error),
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
        forceRequestLocation,
        useSignificantChanges,
        distanceFilter,
        showLocationDialog,
      },
    );
  });
};
