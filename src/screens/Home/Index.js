import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Animated, Easing, BackHandler, ToastAndroid } from 'react-native';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Index = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [backPressCount, setBackPressCount] = useState(0);

  useEffect(() => {
    const handleBackPress = () => {
      if (backPressCount === 1) {
        BackHandler.exitApp(); // Exit the app if back button is pressed twice within 2 seconds
        return true;
      }

      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      setBackPressCount(1);

      const timeout = setTimeout(() => {
        setBackPressCount(0);
      }, 2000); // Reset back press count after 2 seconds

      return true; // Prevent default behavior
    };

    if (isFocused) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => backHandler.remove(); // Cleanup the event listener when the component unmounts or navigates away
    }
  }, [backPressCount, isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      const startAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
      };

      startAnimation();

      return () => scaleAnim.stopAnimation(); // Cleanup the animation when the component unmounts or navigates away
    }, [scaleAnim])
  );

  const confirmRecording = () => {
    navigation.navigate('VideoRecordPage');
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      confirmRecording();
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/demoLogo.jpg')} // Replace with your logo path
        style={styles.logo}
      />

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pModalCheckCircle}
        >
          <Text style={styles.buttonText}>Start Recording</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    position: 'absolute',
    top: 100,
    width: 180, // Adjust the width of the logo
    height: 100, // Adjust the height of the logo
    resizeMode: 'contain',
  },
  buttonText: {
    width: '90%',
    alignSelf: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15, // Slightly more rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 }, // More pronounced shadow
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    padding: 20,
  },
  cancelDeleteBtn: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 7
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  confirmDeleteBtn: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 7
  },
  pModalCheckCircle: {
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: '#c9170a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});