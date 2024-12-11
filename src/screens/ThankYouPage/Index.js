import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Index = () => {

    const navigation = useNavigation();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
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
    }, []);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const handleSubmit = () => {
        // Handle submit action
        console.log('Feedback submitted');
        navigation.navigate('Home');
    };

    return (
        <View style={styles.pModalContainer}>
            <View style={styles.pModalContent}>
                <Animated.View style={[styles.pModalCheckCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <FontAwesome name='check' color={'#fff'} size={60} />
                </Animated.View>
                <Text style={styles.pModalCongratulationsText}>Thank You!</Text>
                {/* <Text style={styles.pModalCongratulationsText}>For Your Feedback.</Text> */}
                <Text style={[styles.pModalDetailText, { marginTop: 25 }]}>Can we post this feedback to our social media?</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.optionButton, selectedOption === 'yes' && styles.selectedYesButton]}
                        onPress={() => handleOptionSelect('yes')}
                    >
                        <Text style={[styles.buttonText, selectedOption === 'yes' && styles.activeButtonText]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.optionButton, selectedOption === 'no' && styles.selectedNoButton]}
                        onPress={() => handleOptionSelect('no')}
                    >
                        <Text style={[styles.buttonText, selectedOption === 'no' && styles.activeButtonText]}>No</Text>
                    </TouchableOpacity>
                </View>
                {selectedOption ?
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={[styles.buttonText, { color: '#fff' }]}>Submit</Text>
                    </TouchableOpacity>
                    :
                    <View style={styles.disableSubmitButton}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </View>
                }
            </View>
        </View>
    );
};

export default Index;

const styles = StyleSheet.create({
    pModalContainer: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    pModalContent: {
        alignItems: 'center',
        justifyContent: 'center',
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
    pModalCongratulationsText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    pModalDetailText: {
        fontSize: 16,
        color: '#424242',
        textAlign: 'center',
        paddingHorizontal: 30,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '60%',
        marginBottom: 20,
    },
    optionButton: {
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#424242',
    },
    selectedYesButton: {
        backgroundColor: '#388E3C',
        borderWidth: 0,
    },
    selectedNoButton: {
        backgroundColor: '#D32F2F',
        borderWidth: 0,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    activeButtonText: {
        color: '#fff',
    },
    submitButton: {
        backgroundColor: '#234fb8',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginTop: 20
    },
    disableSubmitButton: {
        backgroundColor: '#b6b6b6',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginTop: 20
    },
});