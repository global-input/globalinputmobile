import React, { Component } from 'react';
import {Text,View} from 'react-native';

import {styles} from "./styles";

import {menusConfig} from "../configs";

import {DisplayBlockText,ViewWithTabMenu} from "../components";




const helpContentConfig={

  header:{
         title:"Global Input App",
         subtitles:["Copyright © 2017-2022","Iterative Solution Limited"]
  },
  secureStorage:{
     title: "",
     content:['This app allows you to store and manage confidential information on your mobile and use it to interact with various devices around you, leading to an array of useful features. When you are using computers, IoT devices, self-service machines, cloud services, or accessing company or public facilities, you can use your mobile to identify yourself, and then operate on them using your mobile.',
     "To see full list of features the app offers, please visit the following website:",
     
     {type:"text", content:"https://globalinput.co.uk/", url:"https://globalinput.co.uk/global-input-app/about"}
    ]
  }
  /*
  transferContent:{
     title:"Encrypted Data Transfer",
     content:["You can transfer data between two Global Input App instances using end-to-end encryption. When you are editing or creating a data item on the \"Data\" tab, you can press the \"QR Code\" button to display a QR Code. If you scan the QR Code with another Global Input App instance,  they will be connected to each other via end-to-end encryption.",
              "Please visit the URL below with a browser on a computer for information on how to transfer content between your mobile and computers,",
              {type:"text", content:"https://globalinput.co.uk/", url:"https://globalinput.co.uk/"}
         ]
   },
  encryptedQRCode:{
     title:"Encrypted QR Code",
     content:[
       "You can create encrypted QR Codes on the \"Encrypt\" tab. You may choose to print out the QR codes and use printed papers as the medium to store your confidential content. You can scan the QR codes with the same Global Input app instance to reveal their decrypted content on your mobile screen. Other Global Input App instances will not be able to decrypt the encrypted QR Codes unless you have shared the encryption key that you have selected for use when creating the encrypted QR code. You can manage and share encryption keys on the \"Keys\" tab.",
         "Please visit the URL below using a browser on a computer for more information on how to use the encrypted QR Codes to transfer or store confidential content.",
         {type:"text", content:"https://globalinput.co.uk/", url:"https://globalinput.co.uk/"}
       ]
  },
  exportimportData:{
    title:"Export/Import Data",
    content:["You can export/import data on the \"More\" tab. Global Input App does not store your data outside your device, so it is important to export your data for backup in case you lose your phone.  The exported data is always encrypted with an encryption key that is marked as \"Active\" on the \"Keys\" tab. Hence, you need to export the encryption key and store it in a separate place in case you lose your phone. This is important because only the Global Input App instance, which has the same encryption key marked as \"Active\", can import the exported data.",
     "You can manage/export encryption keys on the \"Keys\" tab. The app uses password protected QR codes or password protected content for exporting the encryption keys."]
  },


  aboutThisApp:{
       title:"About Global Input App",
       content:["Global Input App is a free app, created by Dr. Dilshat Hewzulla (dilshat@iterativesolution.co.uk). Please visit the following URL for more information.",
               {type:"text",content:"https://globalinput.co.uk/global-input-app/about", url:"https://globalinput.co.uk/global-input-app/about"}
             ]


  },
  */


}
export  default class HelpScreen extends Component{
  renderSubtitle(){
    return(
    <View style={styles.subtitleContainer}>
        {helpContentConfig.header.subtitles.map((subtitle,index)=>{
          var key=index+"_"+subtitle;
           return(
              <View style={styles.subtitle} key={key}>
                 <Text style={styles.subtitleText}>{subtitle}</Text>
             </View>
           );
        })}
    </View>
  );
  }
  renderHeader(){
      return (
             <View style={styles.header}>
                  <View style={styles.titlesContainer}>
                      <Text style={styles.titleText}>{helpContentConfig.header.title}</Text>
                  </View>
             </View>



    );
  }
  render(){
      return(
        <ViewWithTabMenu title={helpContentConfig.header.title}
        menuItems={this.props.menuItems} selected={menusConfig.help.menu}>
        <View style={styles.content}>

        <View style={styles.section}>

                            <DisplayBlockText title={helpContentConfig.secureStorage.title}
                                              content={helpContentConfig.secureStorage.content}/>
        </View>


        


       

    </View>
                </ViewWithTabMenu>
      );
  }
}
