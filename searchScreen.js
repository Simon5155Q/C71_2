import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import database from "../config"

export default class SearchScreen extends Component{
  constructor(){
    super();
    this.state={
      search:'',
      allTransactions: []
    }
  }
  searchTransactions = async(text) => {
    var item1 = text.split("");
    if(item1[0].toLowerCase() === "b"){
      const query = await database.collection("transactions").where("bookID", "===", text).limit(10).get();
      query.docs.map((doc)=>{
        console.log(doc.data);
        this.setState({
          allTransactions:[...allTransactions, doc.data()]
        })
      })
    }
    else if(item1[0].toLowerCase() === s){
      const query = await database.collection("transactions").where("studentID", "===", text).limit(10).get();
      query.docs.map((doc)=>{
        this.setState({
          allTransactions:[...allTransactions, doc.data()]
        })
      }) 
    }
    else{
      alert("hello");
    }
  }
    render(){
      return (
        <View>
              <TextInput 
              placeholder="enter book ID or student ID" 
              onChange={(text)=>{
                this.setState({
                  search:text
                })
              }}
              style={{
                borderWidth:5,
                width:"75%",
                height:"50%"
              }}
              ></TextInput>
              <TouchableOpacity               
              style={{
                borderWidth:5,
                width:"5%",
                height:"50%",
                borderColor:"blue"
              }}
              onPress={()=>{this.searchTransactions(this.state.search)}}
              ><Text>Search</Text></TouchableOpacity>

              {/* <FlatList 
              data={this.state.allTransactions}
              renderItem={(text)=>{
                <View>
                  <Text>{"bookID:"+ query.bookID}</Text>
                  <Text>{"studentID:"+ query.studentID}</Text>
                  <Text>{"time:"+ query.time.toDate()}</Text>
                  <Text>{"transaction type:"+ query.transactionType}</Text>
                </View>
              }}

              ></FlatList> */}
        </View>
      );
    }
  }
