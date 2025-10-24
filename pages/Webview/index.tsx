import AntDesign from '@expo/vector-icons/AntDesign';
import * as StoreReview from 'expo-store-review';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Modal,
  PermissionsAndroid,
  Platform,
  Text,
  ToastAndroid,
  View
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { scaleFont } from '@/constants/ScaleFont';
import { styles } from './style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Application from 'expo-application';
export default function Webview() {
  const webViewRef = useRef<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const lastBackPressRef = useRef(0);
  const navigation = useNavigation<any>();
  const [AndroidID, setAndroidID] = useState('');
  const [subscriptionID, setsubscriptionID] = useState<string | null>(null);
  const canGoBackRef = useRef(false);

  const [appOpenCount, setAppOpenCount] = useState(0);
  const lastReviewRequest = useRef<number>(0);
  const [appState, setAppState] = useState(AppState.currentState);

  const checkNetworkStatus = () => {
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        navigation.navigate('Network'); // Navigate to network error page
      }
    });
  };

  const checkAndRequestReview = async () => {
    console.log(appOpenCount);

    try {
      // Only request review if:
      // 1. The app has been opened at least 5 times
      // 2. It's been at least 7 days since the last review request
      // 3. The device is capable of showing the review dialog
      const now = Date.now();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      if (
        appOpenCount === 5 &&
        await StoreReview.hasAction() &&
        await StoreReview.isAvailableAsync()
      ) {
        await StoreReview.requestReview();
        lastReviewRequest.current = now;
      }
    } catch (error) {
      console.log('Error requesting review:', error);
    }
  };
  async function getId() {
    const id = await AsyncStorage.getItem('subscriptionId');
    console.log(id);
    setsubscriptionID(id);
  }


  useEffect(() => {
    // getting androidID
    const androidid = Application.getAndroidId()
    setAndroidID(androidid);
    getId();


    // Handle hardware back press for moving previous page and exit the app

    const reviewSubscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        setAppOpenCount(prev => prev + 1);
        checkAndRequestReview();
      }

      setAppState(nextAppState);
    });

    return () => {
      reviewSubscription.remove();
      // Remove event listener when component unmounts
    };
  }, [
    appOpenCount,
    appState,
  ]);

  useEffect(() => {
    const backAction = () => {
      console.log('canGoBackRef.current:', canGoBackRef.current);
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        lastBackPressRef.current = 0; // Reset timer when going back in WebView
        return true;
      }

      const now = Date.now();
      if (lastBackPressRef.current && now - lastBackPressRef.current < 2000) {
        console.log('Exiting app');
        BackHandler.exitApp(); // exit app on second press
        console.log('Exiting app 2');
        return true;
      }
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      lastBackPressRef.current = now;
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);



  return (
    <>
      {/* here i am checking the user status for getting the link from api if user status is pending the api doesn't provide the link that case it navigate to bending screen once the status is success it will provid the link and user navigate to webview  */}

      <WebView
        userAgent={`infogreen-c-app/${AndroidID}/${subscriptionID}`}
        source={{ uri: 'https://user.kongudheeranmanamalai.com/auth-login.php' }}
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.container, styles.horizontal]}>
            <ActivityIndicator size="large" color="#00ff00" />
          </View>
        )}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        incognito={true}
        pullToRefreshEnabled={false}
        ref={webViewRef}
        onNavigationStateChange={navState => {
          setCanGoBack(navState.canGoBack);
          canGoBackRef.current = navState.canGoBack; // keep latest value
        }}
        textZoom={100}
        onError={(e) => {
          const { description } = e.nativeEvent;
          console.warn('WebView Error:', description);
          if(description==="net::ERR_INTERNET_DISCONNECTED"){
            navigation.navigate('Network');
          }
          else{
            Alert.alert('Page Load Error', description, [
              { text: 'Retry', onPress: () => webViewRef.current?.reload() },
            ]);
          }
        }}
      />

    </>
  );
}
