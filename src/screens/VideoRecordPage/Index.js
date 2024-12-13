import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PermissionsAndroid, Platform, Alert, Modal, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import KeepAwake from 'react-native-keep-awake';
import { Video } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const Index = () => {

    const navigation = useNavigation();
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUri, setRecordedVideoUri] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [timer, setTimer] = useState(60);
    const [cameraInitialized, setCameraInitialized] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    const [loaderModalVisible, setLoaderModalVisible] = useState(false);
    const openLoaderModal = () => setLoaderModalVisible(true);
    const closeLoaderModal = () => setLoaderModalVisible(false);

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

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                uploadStoredVideos();
            }
        });

        return () => unsubscribe();
    }, []);

    const startRecording = async () => {
        try {
            if (cameraRef.current) {
                const video = await cameraRef.current.startRecording({
                    fileType: 'mp4',
                    onRecordingFinished: (video) => {
                        setRecordedVideoUri(video.path);
                        setIsRecording(false);
                        compressVideo(video.path);
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

    const compressVideo = async (inputPath) => {
        try {
            openLoaderModal();
            console.log('Compression started...');
            const compressedVideoPath = await Video.compress(inputPath, {
                compressionMethod: 'manual',
                quality: 'low', // Choose 'low' for maximum compression
                bitrate: 400000, // Set lower bitrate for more compression (1 Mbps)
                frameRate: 10, // Lower frame rate for further size reduction
                minimumFileSizeForCompression: 1, // Compress even the smallest files
            });

            console.log('Compression completed successfully!');
            console.log('Compressed video path:', compressedVideoPath);

            const fileInfo = await RNFS.stat(compressedVideoPath);
            console.log('Compressed video file info:', fileInfo);

            // await uploadVideo(compressedVideoPath);
            if (isConnected) {
                await uploadVideo(compressedVideoPath);
            } else {
                await storeVideoLocally(compressedVideoPath);
            }
        } catch (error) {
            console.error('Error during video compression:', error);
            Alert.alert('Error', `Error during video compression: ${error.message}`);
            closeLoaderModal();
        }
    };

    const storeVideoLocally = async (videoPath) => {
        try {
            const storedVideos = await AsyncStorage.getItem('storedVideos');
            const videos = storedVideos ? JSON.parse(storedVideos) : [];
            videos.push(videoPath);
            await AsyncStorage.setItem('storedVideos', JSON.stringify(videos));
            console.log('Video stored locally:', videoPath);
            navigation.navigate('ThankYouPage');
        } catch (error) {
            console.error('Error storing video locally:', error);
        } finally {
            setLoaderModalVisible(false);
        }
    };

    const uploadStoredVideos = async () => {
        try {
            const storedVideos = await AsyncStorage.getItem('storedVideos');
            const videos = storedVideos ? JSON.parse(storedVideos) : [];
            for (const videoPath of videos) {
                await uploadVideo(videoPath);
            }
            await AsyncStorage.removeItem('storedVideos');
        } catch (error) {
            console.error('Error uploading stored videos:', error);
        }
    };

    const uploadVideo = async (videoUri) => {
        try {
            const formData = new FormData();
            formData.append('feedback_video', {
                uri: Platform.OS === 'android' ? `file://${videoUri}` : videoUri,
                type: 'video/mp4',
                name: 'compressed_video.mp4',
            });

            const response = await fetch('https://admin.33crores.com/api/save-feedback-video', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });

            const responseData = await response.json();
            if (response.ok) {
                console.log('Video uploaded successfully', responseData);
                navigation.navigate('ThankYouPage');
            } else {
                console.error('Video upload failed');
                Alert.alert('Error', 'Video upload failed');
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            Alert.alert('Error', `Error uploading video: ${error.message}`);
        } finally {
            setLoaderModalVisible(false);
        }
    };

    const stopRecording = async () => {
        try {
            if (cameraRef.current) {
                await cameraRef.current.stopRecording();
                setIsRecording(false);
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
                            audio={true}
                            onInitialized={() => setCameraInitialized(true)}
                        />
                        {isRecording && (
                            <View style={styles.timerContainer}>
                                <AnimatedCircularProgress
                                    size={70}
                                    width={8}
                                    fill={(timer / 60) * 100}
                                    tintColor="#fff"
                                    backgroundColor="#3d5875"
                                >
                                    {() => (
                                        <Text style={styles.timerText}>{timer}</Text>
                                    )}
                                </AnimatedCircularProgress>
                            </View>
                        )}
                        {/* /* <View style={styles.controlContainer}> */}
                        <ImageBackground source={require('../../assets/images/cameraBg.png')} style={styles.controlContainer} resizeMode="contain">
                            {isRecording ?
                                <TouchableOpacity onPress={stopRecording}>
                                    <MaterialCommunityIcons name="circle-slice-8" size={100} color="#c9170a" />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={startRecording}>
                                    <MaterialCommunityIcons name="circle-slice-8" size={100} color="#10e3d6" />
                                </TouchableOpacity>
                            }
                        </ImageBackground>
                        {/* </View> */}
                    </>
                ) : (
                    <Text style={{ color: '#000' }}>Requesting Camera Permission</Text>
                )}
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={loaderModalVisible}
                onRequestClose={closeLoaderModal}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: 10 }}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        borderWidth: 5,
        borderColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
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
        backgroundColor: 'rgba(255, 250, 250, 0.7)',
        height: 230,
        width: '100%',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Index;
