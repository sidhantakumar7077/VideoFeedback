import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Base_url } from '../../../App';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setShowError(false);
        if (!email || !password) {
            setErrorMessage('Please fill all fields');
            setShowError(true);
            setIsLoading(false);
            setTimeout(() => {
                setShowError(false);
                setErrorMessage('');
            }, 10000);
            return;
        }
        try {
            const response = await fetch(`${Base_url}api/check-unit-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: email,
                    password: password,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('accessToken', data.data.token);
                // console.log("object", data.data.token);
                setIsLoading(false);
                navigation.navigate('Home');
            } else {
                setIsLoading(false);
                setErrorMessage(data.message || 'Login failed. Please try again.');
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                    setErrorMessage('');
                }, 10000);
            }
        } catch (error) {
            setIsLoading(false);
            setErrorMessage('An error occurred. Please try again later.');
            console.log("error", error);
            setShowError(true);
            setTimeout(() => {
                setShowError(false);
                setErrorMessage('');
            }, 10000);
        }
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
            <ImageBackground
                source={require('../../assets/images/Login_BG.png')}
                style={{
                    flex: 1,
                    resizeMode: 'cover',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                    <Image
                        source={require('../../assets/images/transLemoLogo.png')}
                        style={{ height: 130, width: 130, resizeMode: 'contain' }}
                    />
                </View>
                <View style={styles.footer}>
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <Text style={styles.loginPrompt}>Login to continue</Text>
                    <FloatingLabelInput
                        label="Username"
                        value={email}
                        customLabelStyles={{
                            colorFocused: '#c80100',
                            fontSizeFocused: 14,
                        }}
                        labelStyles={{
                            backgroundColor: '#ffffff',
                            paddingHorizontal: 5,
                        }}
                        keyboardType="default"
                        autoCapitalize='none'
                        onChangeText={setEmail}
                        containerStyles={{
                            borderWidth: 0.5,
                            borderColor: '#353535',
                            backgroundColor: '#ffffff',
                            padding: 10,
                            borderRadius: 8,
                            marginVertical: 12,
                            marginHorizontal: 50,
                            borderRadius: 100,
                        }}
                    />
                    <FloatingLabelInput
                        label="Password"
                        value={password}
                        customLabelStyles={{
                            colorFocused: '#c80100',
                            fontSizeFocused: 14,
                        }}
                        labelStyles={{
                            backgroundColor: '#ffffff',
                            paddingHorizontal: 5,
                        }}
                        secureTextEntry
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        containerStyles={{
                            borderWidth: 0.5,
                            borderColor: '#353535',
                            backgroundColor: '#ffffff',
                            padding: 10,
                            borderRadius: 8,
                            marginVertical: 12,
                            marginHorizontal: 50,
                            borderRadius: 100,
                        }}
                    />
                    {showError && <Text style={styles.errorText}>{errorMessage}</Text>}
                </View>
                <View style={styles.bottom}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#c80100" />
                    ) : (
                        <TouchableOpacity
                            onPress={handleLogin}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>SUBMIT</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ImageBackground>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    footer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: 10,
        marginTop: 10,
    },
    welcomeText: {
        fontSize: 18,
        fontFamily: 'okra',
        fontWeight: 'bold',
        color: '#353535',
    },
    loginPrompt: {
        fontSize: 15,
        fontFamily: 'okra',
        fontWeight: '600',
        color: '#353535',
        marginBottom: 18,
    },
    bottom: {
        flex: 0.5,
        backgroundColor: 'transparent',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        padding: 10,
        height: 45,
        width: 150,
        marginBottom: 12,
        backgroundColor: '#c80100',
        borderRadius: 100,
        alignItems: 'center',
        shadowOffset: { height: 10, width: 10 },
        shadowOpacity: 0.6,
        shadowColor: 'black',
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#ffffff',
        fontFamily: 'Titillium Web',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
        fontSize: 14,
    },
    registerPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10, // Adjust spacing below the button
        backgroundColor: 'transparent',
    },
    registerText: {
        fontSize: 14,
        color: '#353535',
        fontFamily: 'Titillium Web',
    },
    registerLink: {
        fontSize: 14,
        color: '#c80100',
        fontWeight: 'bold',
        fontFamily: 'Titillium Web',
    },
});