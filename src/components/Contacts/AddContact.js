import React, { useState } from "react";
import { firestore, auth } from "../../firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

const AddContact = () => {
  const [email, setEmail] = useState("");

  const handleAddContact = async () => {
    const userRef = doc(firestore, "users", auth.currentUser.uid);
    const contactRef = doc(firestore, "users", email);
    await updateDoc(userRef, {
      contacts: arrayUnion(contactRef)
    });
  };

  return (
    <div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo del contacto" />
      <button onClick={handleAddContact}>Agregar Contacto</button>
    </div>
  );
};

export default AddContact;
