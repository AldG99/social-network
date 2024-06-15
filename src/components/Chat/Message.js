import React from "react";

const Message = ({ message }) => {
  return (
    <div>
      <p><strong>{message.sender}:</strong> {message.text}</p>
    </div>
  );
};

export default Message;
