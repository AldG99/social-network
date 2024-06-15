import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Profile from "./components/Auth/Profile";
import ContactList from "./components/Contacts/ContactList";
import AddContact from "./components/Contacts/AddContact";
import ChatWindow from "./components/Chat/ChatWindow";
import { auth } from "./firebaseConfig";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  componentDidCatch() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      } else {
        this.setState({ user: null });
      }
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Routes>
            <Route path="/" element={this.state.user ? <Navigate to="/profile" /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={this.state.user ? <Profile /> : <Navigate to="/" />} />
            <Route path="/contacts" element={this.state.user ? <ContactList /> : <Navigate to="/" />} />
            <Route path="/add-contact" element={this.state.user ? <AddContact /> : <Navigate to="/" />} />
            <Route path="/chat/:contactEmail" element={this.state.user ? <ChatWindow /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    )
  }
}

export default App;
