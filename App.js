import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Speech from 'expo-speech';
import { Container, Content } from 'native-base'
import Swiper from 'react-native-swiper'

import CameraComponent from './cam.js'
const styles = StyleSheet.create({
  slideDefault: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB'
  },
  text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold'
  }
})
export default class App extends React.Component {

  constructor() {
    super()
    this.state = {
      outerScrollEnabled: true
    }
  }

  verticalScroll = (index) => {
    if (index !== 1) {
      this.setState({
        outerScrollEnabled: false
      })
    }
    else {
      this.setState({
        outerScrollEnabled: true
      })
    }
  }
   
  render() {
	  var feature = "object";
    return (
      <Container>
        <Content>
          <Swiper
            loop={false}
            showsPagination={false}
            index={1}
            scrollEnabled={this.state.outerScrollEnabled}
			onIndexChanged = { () => {
				if (feature === "object"){
					feature = "Text Detection";
				}
				else {
					feature = "object";
				}
				Speech.speak(feature, {
				  rate: this.state.rate,
				});	
				console.log("Feature change" )} }
          >

            <View style={styles.slideDefault}>
              <Text style={styles.text}>Vavi</Text>
            </View>
            <Swiper
              loop={false}
              showsPagination={false}
              horizontal={false}
              index={1}
              onIndexChanged={(index) => this.verticalScroll(index)}
            >
              <View style={styles.slideDefault}>
                <Text style={styles.text}>Search</Text>
              </View>
              <View style={{ flex: 1 }}>
                <CameraComponent feature="Object"></CameraComponent>
              </View>
              <View style={styles.slideDefault}>
                <CameraComponent feature="Text"></CameraComponent>
              </View>
            </Swiper>
            <View style={{ flex: 1 }}>
              <CameraComponent feature="Text"></CameraComponent>
            </View>
          </Swiper>
        </Content>
      </Container>
    );
  }
}
// export default class App extends React.Component {

//     constructor() {
//       super()

//       }
//       render(){
//         return(
//           <Text>YOLO chl ja begairtan aik import check</Text>
//         )
//       }
//     }

