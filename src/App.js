import React, { Component } from "react";
import "./App.css";
import AppProvider from "./components/statefull/Provider";
import Main from "./components/statefull/Main";
import { firebaseInit, constructUrl } from "./helperFunctions/index";
//Init the firebase database
import * as fb from "firebase";

const config = {
};

const firebase = fb.initializeApp(config);
export const firestore = firebase.firestore();

class App extends Component {
  render() {
    return (
      <AppProvider>
        <Main />
      </AppProvider>
    );
  }
}

export default App;
