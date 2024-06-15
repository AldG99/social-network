import React, { useState, useEffect } from "react";
import { firestore, auth } from "../../firebaseConfig";
import { collection, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import Message from "./Message";

const ChatWindows = ({ contactEmail }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = query(
        collection(doc(collection(firestore, "chat"), `${auth.currentUser.uid}_${contactEmail}`), "messages"),
        orderBy("timestamp", "asc")
      );
      onSnapshot(messagesRef, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });
    };
    fetchMessages();
  }, [contactEmail]);

  const handleSendMessage = async () => {
    const message = {
      text: input,
      sender: auth.currentUser.email,
      timestamp: serverTimestamp()
    };
    await addDoc(collection(doc(collection(firestore, "chats"), `${auth.currentUser.uid}_${contactEmail}`), "messages"), message);
    setInput("");
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe un mensaje..."
      />
      <button onClick={handleSendMessage}>Enviar</button>
    </div>
  );
};

export default ChatWindows;
