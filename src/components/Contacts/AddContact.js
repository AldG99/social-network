import React, { useState } from "react";
import { firestore, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

const AddContact = () => {
  const [userId, setUserId] = useState("");
  const [contact, setContact] = useState(null);
  const [error, setError] = useState("");

  const handleSearchById = async () => {
    setError("");
    setContact(null);
    try {
      const q = query(collection(firestore, "users"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const contactDoc = querySnapshot.docs[0];
        setContact({ ...contactDoc.data(), uid: contactDoc.id });
      } else {
        setError("Usuario no encontrado");
      }
    } catch (error) {
      console.error("Error buscando el usuario:", error);
      setContact("Error buscando el usuario");
    }
  };

  const handleSendFriendRequest = async () => {
    if (!contact) return;

    try {
      const fromUserId = auth.currentUser.uid;
      const toUserId = contact.uid;
      const currentUser = auth.currentUser;

      await addDoc(collection(firestore, "friendRequests"), {
        from: fromUserId,
        to: toUserId,
        status: "pending",
        fromUserName: currentUser.displayName || "Anonymous",
        fromUserId: currentUser.uid
      });

      alert("Solicitud de amistad enviada con éxito");
      setContact(null);
      setUserId("");
    } catch (error) {
      console.error("Error enviando la solicitud de amistad:", error);
      setError("Error enviando la solicitud de amistad");
    }
  };

  return (
    <div>
      <h2>Añadir Contacto</h2>
      {error && <p style={{ color: "red"}}>{error}</p>}
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Id único del contacto"
      />
      <button onClick={handleSearchById}>Buscar</button>
      {contact && (
        <div>
          <p>Nombre: {contact.firstName} {contact.lastName}</p>
          <button onClick={handleSendFriendRequest}>Enviar Solicitud de Amistad</button>
        </div>
      )}
    </div>
  );
};

export default AddContact;
