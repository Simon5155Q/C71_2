import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  DrawerLayoutAndroidatabasease,
  Alert
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import *as firebase from 'firebase';
import database from '../config';

export default class transactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      buttonState: 'normal',
      scanned: false,
      permissions: null,
      bookScannedData: '',
      studentScannedData: '',
      //scannedData:'',
    };
  }

  askPerms = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      permissions: status === 'granted',
      buttonState: id,
    });
  };

  handleBarcodeScans = async ({ type, data }) => {
    var buttonState=this.state;
    if (buttonState==="bookId"){
      this.setState({
      scanned: true,
      bookScannedData: data,
      buttonState: 'normal',
    });
    }
    else if (buttonState==="studentId"){
     this.setState({
      scanned: true,
      studentScannedData: data,
      buttonState: 'normal',
    });
    }
   
  };

  initiateBookIssue = async()=>{
    await database.collection("transactions").add({
      'studentId': this.state.studentScannedData,
      'bookId' : this.state.bookScannedData,
      'date' : firebase.firestore.Timestamp.now().toDate(),
      'transactionType': "Issue"
    }); 
    database.collection("books").doc(this.state.bookScannedData).update({
      'bookAvailability': false
    });
    database.collection("student").doc(this.state.studentScannedData).update({
      'booksIssued': firebase.firestore.FieldValue.increment(1)
    });
  }

  initiateBookReturn = async()=>{
    await database.collection("transactions").add({
      'studentId': this.state.studentScannedData,
      'bookId' : this.state.bookScannedData,
      'date' : firebase.firestore.Timestamp.now().toDate(),
      'transactionType': "Return"
    });
    database.collection("books").doc(this.state.bookScannedData).update({
      'bookAvailability': true
    });
    database.collection("student").doc(this.state.studentScannedData).update({
      'booksIssued': firebase.firestore.FieldValue.increment(-1)
    });
  }

  checkBookEligibility = async() =>{
    var transactionType = '';
    const bookRef = await database.collection("books").where("bookID","===",this.state.bookScannedData).get();
    console.log(bookRef);
      if(bookRef.docs.length == 0){
        transactionType = false;
      }
      else{
        bookRef.docs.map((doc)=>{
          var book = doc.data();
          if(book.bookAvailability){
            transactionType = "issue";
          }
          else{
            transactionType = "return";
          } 
        }) 
      }
    
        return transactionType;

  }

  checkStudentEligibilityIssue = async() => {
    const studentRef = await database.collection("student").where("studentID","===", this.state.studentScannedData).get();
    var isStudentEligible = '';

    if(studentRef.docs.length == 0){
      isStudentEligible = false;
      alert("student is not eligible for book issue");
    }
    else{
      studentRef.docs.map((doc)=>{
        var student = doc.data();
        if(student.studentBookIssued < 2){
          isStudentEligible = true;
          alert("student is eligible");
        }
        else{
          isStudentEligible = false;
          alert("maximum amount of books cannot be exceeded");
        }
      })
    }
    this.setState({
      studentScannedData: '',
      bookScannedData: '',
    })
    return isStudentEligible;
  }
  checkStudentEligibilityReturn = async() => {
    const bookRef = await database.collection("transaction").where("bookID","===", this.state.bookScannedData).get();
    var isStudentEligible = '';
    bookRef.docs.map((doc)=>{
      var lastTransaction = doc.data();
      if(lastTransaction.studentID === this.state.studentScannedData){
        isStudentEligible = true;

      }
      else{
        isStudentEligible = false;
        alert("Student is not eligible for return of this book");
      }
    })
    this.setState({
      studentScannedData: '',
      bookScannedData:'',
    })
    return isStudentEligible;
  }
  

  handleTransactions = async() => {
      var transactionType = await this.checkBookEligibility();
      if(!transactionType){
        alert("the book which you are searching for does not exist");
      }
      else if(transactionType === 'issue'){
        var isStudentEligible = await this.checkStudentEligibilityIssue();
        if(isStudentEligible === true){
          this.initiateBookIssue();
          alert("Book Issued");
        }
        else{
          alert("student is not eligible for book issue");
        }
      }
      else if(transactionType === 'return'){
        var isStudentEligible1 = await this.checkStudentEligibilityReturn();
        if(isStudentEligible1 === true){
          this.initiateBookReturn();
          alert("Book Returned");
        }
        else{
          alert("the student is not eligible for book return");
        }
      }
      else{
        alert("student is not eligible");
      }
    }

  
  

  render() {
    if (this.state.buttonState !== 'normal' && this.state.permissions) {
      return (
        <BarCodeScanner
          onBarcodeScanned={
            this.state.scanned ? undefined : this.handleBarcodeScans
          }
        />
      );
    } else {
      return (
        <View>
         {<Image
            source={require('../assets/booklogo.jpg')}
            style={{ alignSelf: 'center' }}></Image>}
          <Text
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '20%',
              // marginTop: 50,
              flex: 1,
            }}>
            {this.state.permissions === true
              ? this.state.scannedData
              : 'request camera permissions'}
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
            <TextInput
              style={{
                width: 100,
                height: 40,
                borderWidth: 5,
              }}
              placeholder="Book ID"
              onChangeText={text => this.setState({bookScannedData: text})}
              value={this.state.bookScannedData} 
              ></TextInput>
            <TouchableOpacity
             onPress={()=>{this.askPerms("bookId")}}
              style={{
                marginTop: '30%',
                paddingRight:'20%',
                backgroundColor: '#000',
                borderRadius: 10,
                alignSelf: 'center',
              }}>
              <Text style={{ color: '#fff', justifyContent: 'center' }}>
                Scan the QR code for book ID
              </Text>
            </TouchableOpacity>
            <TextInput
              style={{
                width: 100,
                height: 40,
                borderWidth: 5,
                alignSelf:"center",
              }} 
              placeholder="Student ID"
              value={this.state.studentScannedData} 
              onChangeText={text => this.setState({studentScannedData: text})}
              ></TextInput>
            <TouchableOpacity
                onPress={()=>{this.askPerms("bookId")}}
              style={{
                marginTop: '30%',
                paddingRight:'20%',
                backgroundColor: '#000',
                borderRadius: 10,
                alignSelf: 'center',
              }}>
              <Text style={{ color: '#fff', justifyContent: 'center' }}>
                Scan the QR code for student ID
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={async()=>{this.handleTransactions()}}>
              <Text>Sumbit</Text>
              </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}
