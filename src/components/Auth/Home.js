import React from "react";
import Sidebar from "../Chat/Sidebar";
import ChatWindow from "../Chat/ChatWindow";

const Home = () => {
  return (
    <div>
      <div>
        <Sidebar/>
        <ChatWindow/>
      </div>
    </div>
  );
};

export default Home;
