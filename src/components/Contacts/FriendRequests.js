import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../firebaseConfig";
import { doc, getDocs, query, where, collection, updateDoc, getDoc, setDoc } from "firebase/firestore";

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const q = query(
          collection(firestore, "friendRequests"),
          where("to", "==", auth.currentUser.uid),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFriendRequests(requests);
      } catch (error) {
        console.error("Error al obtener solicitudes de amistad:", error);
      }
    };

    fetchFriendRequests();
  }, []);

  const handleAcceptRequest = async (requestId, fromUserId) => {
    try {
      const userContactsDocRef = doc(firestore, "contacts", auth.currentUser.uid);
      const userDocSnap = await getDoc(userContactsDocRef);
      const userContacts = userDocSnap.exists() ? userDocSnap.data().contacts || [] : [];

      await updateDoc(userContactsDocRef, {
        contacts: [...userContacts, fromUserId]
      });

      const friendContactsDocRef = doc(firestore, "contacts", fromUserId);
      const friendDocSnap = await getDoc(friendContactsDocRef);
      const friendContacts = friendDocSnap.exists() ? friendDocSnap.data().contacts || [] : [];

      if (friendDocSnap.exists()) {
        await updateDoc(friendContactsDocRef, {
          contacts: [...friendContacts, auth.currentUser.uid]
        });
      } else {
        await setDoc(friendContactsDocRef, {
          contacts: [auth.currentUser.uid]
        });
      }

      const requestDocRef = doc(firestore, "friendRequests", requestId);
      await updateDoc(requestDocRef, { status: "accepted" });

      setFriendRequests(friendRequests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error("Error al aceptar la solicitud de amistad:", error);
    }
  };

  return (
    <div>
      <h3>Solicitudes de Amistad</h3>
      {friendRequests.length > 0 ? (
        <ul>
          {friendRequests.map(request => (
            <li key={request.id}>
              {request.fromUserName} ({request.fromUserId})
              <button onClick={() => handleAcceptRequest(request.id, request.from)}>Aceptar</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes solicitudes de amistad pendientes.</p>
      )}
    </div>
  );
};

export default FriendRequests;
