import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";

// SplashScreen
import SplashScreen from './src/screens/SplashScreen/Index'

// Auth
import Login from './src/screens/Auth/Login'

// No Internet Pages
import NoInternet from './src/screens/NoInternet/Index'

// Pages
import Home from './src/screens/Home/Index'
import VideoRecordPage from './src/screens/VideoRecordPage/Index'
import ThankYouPage from './src/screens/ThankYouPage/Index'

const Stack = createNativeStackNavigator();

const App = () => {

  const [showSplash, setShowSplash] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [access_token, setAccess_token] = useState('');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      setIsConnected(state.isConnected ?? false);
    });
    return () => {
      unsubscribe();
      // setTimeout(unsubscribe, 5000);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 5000)
  }, []);

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#c9170a" barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showSplash ? (<Stack.Screen name="SplashScreen" component={SplashScreen} options={{ presentation: 'modal', animationTypeForReplace: 'push', animation: 'slide_from_right' }} />) : null}
        {!isConnected ? (
          <Stack.Screen name="NoInternet" component={NoInternet} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="VideoRecordPage" component={VideoRecordPage} />
            <Stack.Screen name="ThankYouPage" component={ThankYouPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App