import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Index = () => {

  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const openModal = () => { setIsModalVisible(true) };
  const closeModal = () => { setIsModalVisible(false) };

  const confirmRecording = () => {
    // setIsModalVisible(false);
    navigation.navigate('VideoRecordPage');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/demoLogo.jpg')} // Replace with your logo path
        style={styles.logo}
      />
      <TouchableOpacity onPress={confirmRecording} style={styles.button}>
        <Text style={styles.buttonText}>Start Recording</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={{ width: '90%', alignSelf: 'center', marginBottom: 10 }}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="camera-reverse-sharp" size={60} color="red" />
                <Text style={{ color: '#000', fontSize: 23, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.3 }}>Are you sure!</Text>
                <Text style={{ color: '#000', fontSize: 17, fontWeight: '500', marginTop: 4, textAlign: 'center', letterSpacing: 0.3 }}>You want to accept the terms and conditions?</Text>
              </View>
            </View>
            <View style={{ width: '95%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 10 }}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelDeleteBtn}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRecording} style={styles.confirmDeleteBtn}>
                <Text style={styles.btnText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    // left: 20,
    width: 180, // Adjust the width of the logo
    height: 100, // Adjust the height of the logo
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#c9170a',
    height: 150,
    width: 150,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
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
});
