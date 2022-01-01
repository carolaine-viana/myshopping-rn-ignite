import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { Photo } from '../../components/Photo';
import storage from '@react-native-firebase/storage';
import { Container, Content, Progress, Transferred } from './styles';
import { Alert } from 'react-native';

export function Upload() {
  const [image, setImage] = useState('');
  const [bytesTransferred, setBytesTransferred] = useState('')
  const [progress, setProgress] = useState('0')

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status == 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.cancelled) {
        setImage(result.uri);
      }
    }
  };

  async function handleUpload(){
    const fileName = new Date().getTime();
    const reference = storage().ref(`/images/${fileName}.png`);
    const uploadTask = reference.putFile(image)

    //on vai acompanhar o progresso do upload da foto
    //pega o total de bytes transferido e divide pela variavel que transferimos
    uploadTask.on('state_changed', taskSnapShot => {
      const percent = ((taskSnapShot.bytesTransferred / taskSnapShot.totalBytes)*100).toFixed(0)
      setProgress(percent)
      setBytesTransferred(`${taskSnapShot.bytesTransferred} transferido de ${taskSnapShot.totalBytes}`)
    })

    uploadTask.then(async() => {
      const imageUrl = await reference.getDownloadURL()
      console.log(imageUrl)
      Alert.alert('upload Concluido com sucesso!')
    })
  }

  return ( 
    <Container>
      <Header title="Upload de Fotos" />

      <Content>
        <Photo uri={image} onPress={handlePickImage} />

        <Button
          title="Fazer upload"
          onPress={handleUpload}
        />

        <Progress>
          {progress}%
        </Progress>

        <Transferred>
         {bytesTransferred}
        </Transferred>
      </Content>
    </Container>
  );
}
