import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storage, auth, firestore } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, query, where, getDocs, collection, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { Link } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState(auth.currentUser.phoneURL || "https://via.placeholder.com/150");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario", error);
      }
    };

    const fetchContacts = async () => {
      try {
        const contactsDoc = await getDoc(doc(firestore, "contacts", auth.currentUser.uid));
        if (contactsDoc.exists()) {
          const contactIds = contactsDoc.data().contacts || [];
          const contactPromises = contactIds.map(id => getDoc(doc(firestore, "users", id)));
          const contactSnapshots = await Promise.all(contactPromises);
          const contactData = contactSnapshots.map(snap => snap.data());
          setContacts(contactData);
        }
      } catch (error) {
        console.error("Error al obtener contactos:", error);
      }
    };

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

    fetchUserData();
    fetchContacts();
    fetchFriendRequests();
  }, []);

  const handleAcceptRequest = async (requestId, fromUserId) => {
    try {
      const userContactsDocRef = doc(firestore, "contacts", auth.currentUser.uid);
      const userDocSnap = await getDoc(userContactsDocRef);
      const userContacts = userDocSnap.exists() ? userDocSnap.data().contacts || [] : [];

      if (userDocSnap.exists()) {
        await updateDoc(userContactsDocRef, {
          contacts: [...userContacts, fromUserId]
        });
      } else {
        await setDoc(userContactsDocRef, {
          contacts: [fromUserId]
        });
      }

      const friendContactsDocRef = doc(firestore, "contacts", fromUserId);
      const friendDocSnap = await getDoc(friendContactsDocRef);
      const friendContacts = friendDocSnap.exists() ? friendDocSnap.data().contact || [] : [];

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
      await updateDoc(requestDocRef, { status: "accepted"});
      
      const newContactDoc = await getDoc(doc(firestore, "users", fromUserId));
      const newContactData = newContactDoc.data();
      setContacts([...contacts, newContactData]);

      setFriendRequests(friendRequests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error("Error al aceptar la solicitud de amistad:", error);
    }
  };

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!image) return;

    const storageRef = ref(storage, `images/${auth.currentUser.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUrl(downloadURL);
          updateProfile(auth.currentUser, { photoURL: downloadURL });
        });
      }
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div>
      <h2>Perfil</h2>
      {userData ? (
        <div>
          <p>Nombre: {userData.firstName} {userData.lastName}</p>
          <p>Edad: {calculateAge(userData.birthDate)}</p>
          <p>ID Única: {userData.userId}</p>
        </div>
      ) : (
        <p>Cargando información del usuario...</p>
      )}
      <p>Correo electrónico: {auth.currentUser.email}</p>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Subir Foto</button>
      <img src={url} alt="Profile" style={{ width: "150px", height: "150px", objectFit: "cover" }}/>
      <button onClick={handleLogout}>Cerrar sesión</button>

      <h3>Contactos</h3>
      {contacts.length > 0 ? (
        <ul>
          {contacts.map((contact, index) => (
            <li key={index}>{contact.firstName} {contact.lastName}</li>
          ))}
        </ul>
      ) : (
        <p>No tienes contactos aún.</p>
      )}

      <h3>Solicitud de Amistad</h3>
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
      <Link to="/add-contact">Añadir Contacto</Link>
    </div>
  );
};

export default Profile;
