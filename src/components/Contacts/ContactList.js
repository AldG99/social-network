import React, { useEffect, useState } from "react";
import { firestore, auth } from "../../firebaseConfig";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const userRef = firestore.collection("users").doc(auth.currentUser.uid);
      const userSnap = await userRef.get();
      const contactRefs = userSnap.data().contacts;
      const contactPromises = contactRefs.map((ref) => ref.get());
      const contactSnaps = await Promise.all(contactPromises);
      setContacts(contactSnaps.map((snap) => snap.data()));
    };
    fetchContacts();
  }, []);

  return (
    <div>
      <h3>Contactos</h3>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.email}>{contact.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
