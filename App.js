import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import { Container, Content } from 'native-base'
import Swiper from 'react-native-swiper'

import CameraComponent from './cam.js'
const styles = StyleSheet.create({
  slideDefault: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
	justifyContent: 'center',
	alignItems: 'center',
  }
})
export default class App extends React.Component {

  constructor() {
    super()
    this.state = {
      outerScrollEnabled: true,
	  feature:1
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
	  var feature = "Object";
    return (
	<View style={{ flex: 1 }}>      
		<CameraComponent >
			<Swiper removeClippedSubviews={true} loop={false} showsPagination={false}>
				<View style={styles.slideDefault}>  
					<Text  style={styles.text}>Hello</Text>
					
				</View>
				
				<View style={styles.slideDefault}>  
					<Text style={styles.text}>Page 2</Text>
				</View>
			
			</Swiper>
		</CameraComponent>	
	</View>
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

