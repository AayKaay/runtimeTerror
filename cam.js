import React, { Component } from "react";
import {
    Animated, View, Text, StyleSheet, Alert 
} from "react-native";
import { v4 as uuid } from "uuid";
import { Camera } from 'expo-camera'
import * as Permissions from "expo-permissions";
import { Container, Content, Header, Item, Icon, Input, Button } from 'native-base'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { decode } from "base64-arraybuffer";
import * as Speech from 'expo-speech';

import Swiper from 'react-native-swiper'
//import * as RNS3 from "react-native-upload-aws-s3";
//Importing in different style

const AWS = require('aws-sdk');
var S3 = require("aws-sdk/clients/s3");

// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAIAT3SRQLVG5O4DVQ';
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
const styless = StyleSheet.create({
  slideDefault: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily:'Roboto'
  },
  fadingContainer: {
    paddingVertical: 5,
    paddingHorizontal: 25,
    backgroundColor: "lightseagreen"
  },
  fadingText: {
    fontSize: 28,
    textAlign: "center",
    margin: 10,
    color : "#fff"
  },
})

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
			feature:"Object",
			fadeAnimation2: new Animated.Value(0),
			fadeAnimation1: new Animated.Value(0),
        }
    }

    async componentWillMount() {
        console.log('check this: ');
        // console.log(Permissions);
        var { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }
	

      

       
        //debugger;
      

    

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
		  if(x == 20){
			  break;
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
			if (this.state.feature == 1){
				this.recognizeText(fileId);
				console.log("OCR")
			}
			else{
				this.recognize(fileId);
				console.log("Image")
			}
			
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
	fadeOut1 = () => {
			Animated.timing(this.state.fadeAnimation1, {
			  toValue: 0,
			  duration: 2000,
			  useNativeDriver: true
			}).start();
		  };
	fadeIn1 = () => {
		Animated.timing(this.state.fadeAnimation1, {
		  toValue: 1,
		  duration: 1,
		  useNativeDriver: true
		}).start();
	};
	fadeOut2 = () => {
			Animated.timing(this.state.fadeAnimation2, {
			  toValue: 0,
			  duration: 2000,
			  useNativeDriver: true
			}).start();
		  };
	fadeIn2 = () => {
		Animated.timing(this.state.fadeAnimation2, {
		  toValue: 1,
		  duration: 1,
		  useNativeDriver: true
		}).start();
	};
    render() {
        var { hasCameraPermission } = this.state;
		
        if (hasCameraPermission === null) {
            return <View />
        }
        else if (hasCameraPermission === false) {
            return <Text> No access to camera</Text>
        }
        else {
            return (
                    <Camera style={{ flex: 1, justifyContent: 'space-between' }} type={this.state.type} ref={(ref) => { this.state.camera = ref }} >	                      
                       <Header style={{backgroundColor: 'transparent'}}></Header>
					   <Swiper removeClippedSubviews={true} loop={false} showsPagination={false} onIndexChanged = { (index) => {
								var speakk="Object Detection";
								if (index == 0){									
									this.fadeIn1();
									
									this.state.feature = 0;
									speakk="Object Detection";
									this.fadeOut1();
								}
								else {
									this.fadeIn2();
									this.fadeOut2();
									this.state.feature = 1;
									speakk="Text Detection";
								}
								Speech.speak(speakk, {
								  rate: this.state.rate,
								});	
							console.log("Feature change" )} }>
							
							<View style={styless.slideDefault}>
									<Animated.View
									  styless={[
										styless.fadingContainer,
										{ opacity: this.state.fadeAnimation1 }
									  ]}
									>
									  <Text  style={styless.text}>Object Detection</Text>
									</Animated.View>								
								
							</View>
							
							<View style={styless.slideDefault}> 
									<Animated.View
									  styless={[
										styless.fadingContainer,
										{ opacity: this.state.fadeAnimation2 }
									  ]}
									>
										<Text style={styless.text}>Text Detection</Text>
									</Animated.View>									
								
							</View>
						
						</Swiper>

                            <View style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="circle-outline"  style={{ color: 'white', fontSize: 100 }} onPress={() => {
                                        this.takePicture().then(() => { }).catch((e) => {
                                            //debugger;
                                            console.log("NAI CHALA")
                                            console.log(e)
                                        })
                                    }}
                                >
								</MaterialCommunityIcons>
                            </View>

                       
                    </Camera>
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