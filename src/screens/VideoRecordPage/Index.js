import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PermissionsAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import KeepAwake from 'react-native-keep-awake';

const Index = () => {
    const navigation = useNavigation();
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUri, setRecordedVideoUri] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [timer, setTimer] = useState(60);
    const [cameraInitialized, setCameraInitialized] = useState(false);

    const devices = useCameraDevices();
    const frontCamera = devices.find(device => device.position === 'front');
    const cameraRef = useRef(null);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        stopRecording();
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        } else {
            setTimer(60);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Request permissions for Android
    async function requestCameraPermission() {
        try {
            const cameraPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'App needs access to your camera',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );

            const audioPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: 'Microphone Permission',
                    message: 'App needs access to your microphone for recording',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );

            if (
                cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
                audioPermission === PermissionsAndroid.RESULTS.GRANTED
            ) {
                setHasPermission(true);
            } else {
                setHasPermission(false);
            }
        } catch (err) {
            console.warn(err);
        }
    }

    useEffect(() => {
        const getPermissions = async () => {
            if (Platform.OS === 'android') {
                await requestCameraPermission();
            } else {
                const cameraPermission = await Camera.requestCameraPermission();
                const microphonePermission = await Camera.requestMicrophonePermission();
                setHasPermission(
                    cameraPermission === 'authorized' && microphonePermission === 'authorized'
                );
            }
        };
        getPermissions();
    }, []);

    useEffect(() => {
        if (hasPermission && frontCamera && cameraInitialized) {
            startRecording();
        }
    }, [hasPermission, frontCamera, cameraInitialized]);

    const startRecording = async () => {
        try {
            if (cameraRef.current) {
                const video = await cameraRef.current.startRecording({
                    fileType: 'mp4',
                    onRecordingFinished: (video) => {
                        setRecordedVideoUri(video.path);
                        setIsRecording(false);
                    },
                    onRecordingError: (error) => {
                        console.error('Recording error:', error);
                    },
                });
                setIsRecording(true);
            }
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = async () => {
        try {
            if (cameraRef.current) {
                await cameraRef.current.stopRecording();
                setIsRecording(false);
                navigation.navigate('ThankYouPage');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    };

    if (!frontCamera) {
        return (
            <View style={styles.container}>
                <Text style={{ color: '#000' }}>Loading Camera...</Text>
            </View>
        );
    }

    return (
        <View style={styles.outerContainer}>
            <View style={styles.container}>
                {hasPermission ? (
                    <>
                        <KeepAwake />
                        <Camera
                            ref={cameraRef}
                            style={StyleSheet.absoluteFill}
                            device={frontCamera}
                            isActive
                            video={true}
                            onInitialized={() => setCameraInitialized(true)}
                        />
                        {isRecording && (
                            <View style={styles.timerContainer}>
                                <AnimatedCircularProgress
                                    size={70}
                                    width={8}
                                    fill={(timer / 60) * 100}
                                    tintColor="#00e0ff"
                                    backgroundColor="#3d5875"
                                >
                                    {() => (
                                        <Text style={styles.timerText}>{timer}</Text>
                                    )}
                                </AnimatedCircularProgress>
                            </View>
                        )}
                        <View style={styles.controlContainer}>
                            {isRecording ?
                                <TouchableOpacity onPress={stopRecording}>
                                    <FontAwesome name="stop-circle-o" size={100} color="#c9170a" />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={startRecording}>
                                    <MaterialCommunityIcons name="circle-slice-8" size={100} color="#fff" />
                                </TouchableOpacity>
                            }
                        </View>
                    </>
                ) : (
                    <Text style={{ color: '#000' }}>Requesting Camera Permission</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        borderWidth: 5,
        borderColor: '#00e0ff',
        // borderRadius: 20,
        // overflow: 'hidden',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    timerContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    timerText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    controlContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        height: 140,
        width: '100%',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Index;