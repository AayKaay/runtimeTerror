import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
	Alert 
} from "react-native";
import { v4 as uuid } from "uuid";
import { Camera } from 'expo-camera'
import * as Permissions from "expo-permissions";
import { Container, Content, Header, Item, Icon, Input, Button } from 'native-base'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { decode } from "base64-arraybuffer";
import * as Speech from 'expo-speech';
//import * as RNS3 from "react-native-upload-aws-s3";
//Importing in different style

const AWS = require('aws-sdk');
var S3 = require("aws-sdk/clients/s3");

// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAJ6YAGGH3LNRQPNUA';
const SECRET = '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';

const BUCKET_NAME = 'bucketforimageocr';
//const BUCKET_NAME = 'images-123123321321';

const s3bucket = new S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    Bucket: BUCKET_NAME,
    signatureVersion: 'v4',
    region: 'ap-south-1',
});

const base64toBlob = (base64Data, contentType) => {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

class CameraComponent extends Component {
    constructor(props) {
        super()
        console.log("wr gye bhai")
		console.log(props.feature)
        this.state = {
            hasCameraPermission: null, camera: null,
            type: Camera.Constants.Type.back,
			
			speech : {
				inProgress: false,
				pitch: 1,
				rate: 0.4,
			},
			feature:props.feature
        }
		this.state.speech.inProgress = true;
		Speech.speak(this.state.feature, { rate: this.state.rate, });	
		this.state.speech.inProgress = false;		
    }

    async componentWillMount() {
        console.log('check this: ');
        // console.log(Permissions);
        var { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }
	
    uploadFileAsync = async (image) => {

        //const arrayBuffer = decode(image);
        // const params = {
        //     Body: arrayBuffer,
        //     Bucket: BUCKET_NAME,
        //     Key: 'abc',
        //     ACL: "public-read",
        //     ContentEncoding: "utf-8",
        //     ContentType: "binary",
        //     // region: 'ap-south-1',

        // };
        // console.log(s3bucket.config)
        // //    s3.putObject(params,(err, data)=> {
        // // 	   if (err) console.log(err, err.stack); // an error occurred
        // //        else     console.log(data); 
        // //    });          // successful response

        // console.log(params.Bucket)
        // s3bucket.upload(params, (err, dataa) => {
        //     if (err) {
        //         console.log(err);
        //         console.log("error in callback");
        //     }
        //     console.log('success');
        //     console.log(dataa);

        // });






        const options = {
            keyPrefix: "uploads/",
            bucket: BUCKET_NAME,
            // region: "us-east-1",
            accessKey: ID,
            secretKey: SECRET,
            successActionStatus: 201
        }
        //debugger;
        const response = await RNS3.put(arrayBuffer, options);
        if (response.status === 201) {
            console.log("Success: ", response.body)
        } else {
            console.log("Failed to upload image to S3: ", response)
        }

    }

	recognize = async (fileId) =>{	
		console.log("Before calling :"+ fileId)
		var stringurl = 'https://2qtsjudl4a.execute-api.ap-south-1.amazonaws.com/deployed/recognize?Key='+fileId;
		console.log("String url :"+ stringurl)
		var x = 1;
		do {
		  var response = await fetch(stringurl);		  
		  var myJson = await response.json();
		  console.log(myJson,x);
		  x = x+1		  
		  if(myJson.message != 'Internal server error') {	
			console.log("Bolay ga");
			const {message} = myJson;
			Speech.speak(message);	
		  }
		}
		while (myJson.message == 'Internal server error'); 		
		console.log(fileId);
		console.log(myJson)
		
	}
	
	recognizeText = async (fileId) =>{	
		console.log("Before calling :"+ fileId)
		var stringurl = 'https://66yv31zy2j.execute-api.ap-south-1.amazonaws.com/deployed/ocr?Key='+fileId;
		console.log("String url :"+ stringurl)
		var x = 1;
		do {
		  var response = await fetch(stringurl);		  
		  var myJson = await response.json();
		  console.log(myJson,x);
		  x = x+1		  
		  if(myJson.message != 'Internal server error') {	
			console.log("Bolay ga");
			const {message} = myJson;
			
			    
			
			this.state.speech.inProgress = true;
			Speech.speak(message, {
				  rate: this.state.rate,
				});	
			this.state.speech.inProgress = false;;
		  }
		}
		while (myJson.message == 'Internal server error'); 		
		console.log(fileId);
		console.log(myJson)
		
	}
	
	createTwoButtonAlert = () =>
    Alert.alert(
      "Alert Title",
      "My Alert Msg",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ],
      { cancelable: false }
    );

    uploadFileAsync2 = async (base64) => {

        const arrayBuffer = decode(base64);
        ////debugger;
        const fileId = uuid();
        const signedUrlExpireSeconds = 60 * 15;

        const url = await s3bucket.getSignedUrlPromise("putObject", {
            Bucket: BUCKET_NAME,
            Key: `${fileId}`,
            ContentType: "binary",
            Expires: signedUrlExpireSeconds
        });
        ////debugger;
        const abc = url;

        fetch(url, {
            method: "PUT",
            body: arrayBuffer,
            headers:{
                "content-type":"binary",
                "content-encoding":"utf-8"
            }
        }).then((res) => {
            //debugger;
            const aaa = res;
        }).catch((e) => {
            //debugger;
            const aaa = 123;
            console.log(e);
        });
        //debugger;
        const yolo = 123;
		if(this.state.speech.inProgress != true){			
			this.recognizeText(fileId);
		}
		else{
			this.createTwoButtonAlert();
		}
    }



    takePicture = async () => {

        const options = { quality: 0.5 ,base64: true };
        const data = await this.state.camera.takePictureAsync(options);
        //   console.log(data);
        console.log("Data should be logged above");
        //debugger;
        this.uploadFileAsync2(data.base64);
    }

    render() {
        var { hasCameraPermission } = this.state

        if (hasCameraPermission === null) {
            return <View />
        }
        else if (hasCameraPermission === false) {
            return <Text> No access to camera</Text>
        }
        else {
            return (
                <View style={{ flex: 1 }}>
                    <Camera style={{ flex: 1, justifyContent: 'space-between' }} type={this.state.type} ref={(ref) => { this.state.camera = ref }} >

                        <Header searchBar rounded
                            style={{
                                position: 'absolute', backgroundColor: 'transparent',
                                left: 0, top: 0, right: 0, zIndex: 100, alignItems: 'center'
                            }}
                        >
                            <View style={{ flexDirection: 'row', flex: 4 }}>
                                <Icon name="logo-snapchat" style={{ color: 'white' }} />
                                <Item style={{ backgroundColor: 'transparent' }}>
                                    <Icon name="ios-search" style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}></Icon>

                                    <Input
                                        placeholder="Search"
                                        placeholderTextColor="white"
                                    />


                                </Item>
                            </View>

                            <View style={{ flexDirection: 'row', flex: 2, justifyContent: 'space-around' }}>
                                <Icon name="ios-flash" style={{ color: 'white', fontWeight: 'bold' }} />
                                <Icon
                                    onPress={() => {
                                        this.setState({
                                            type: this.state.type === Camera.Constants.Type.back ?
                                                Camera.Constants.Type.front :
                                                Camera.Constants.Type.back
                                        })
                                    }}
                                    name="ios-reverse-camera" style={{ color: 'white', fontWeight: 'bold' }} />
                            </View>
                        </Header>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 15, alignItems: 'flex-end' }}>
                            <MaterialCommunityIcons name="message-reply"
                                style={{ color: 'white', fontSize: 36 }}
                            ></MaterialCommunityIcons>

                            <View style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="circle-outline"
                                    style={{ color: 'white', fontSize: 100 }} onPress={() => {
                                        this.takePicture().then(() => { }).catch((e) => {
                                            //debugger;
                                            console.log("NAI CHALA")
                                            console.log(e)
                                        })
                                    }}
                                ></MaterialCommunityIcons>
                                <Icon name="ios-images" style={{ color: 'white', fontSize: 36 }} />
                            </View>
                            <MaterialCommunityIcons name="google-circles-communities"
                                style={{ color: 'white', fontSize: 36 }}
                            ></MaterialCommunityIcons>

                        </View>
                    </Camera>
                </View>
            )
        }
    }
}
export default CameraComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});