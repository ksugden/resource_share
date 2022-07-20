import React, { Component } from "react";
import resourceShareLogo from './resourceShareLogo.png';
import {
  Route,
  Routes,
  NavLink,
  BrowserRouter
} from "react-router-dom";
import App from "./App"
import SelectResource from "./SelectResource";

// TODO: Update naming convention across piece (this should be app.js probably)
class Home extends Component {
    render() {
      return (
        <BrowserRouter>
            <div className="Home">
                <header className="App-header">
                <img src={resourceShareLogo} className="App-logo" alt="logo" />
                <h1>Share Hub</h1>
                </header>
                <NavLink to="/select-resource">Show select resource</NavLink>
                <NavLink to="/app">Show booking app</NavLink>
            </div>
            <Routes>
                <Route path="/select-resource" element={<SelectResource />} />
                <Route path="/app" element={<App />} />
            </Routes>
        </BrowserRouter>
      );
    }
  }
   
  export default Home;