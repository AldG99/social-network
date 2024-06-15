import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storage, auth, firestore } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState(auth.currentUser.phoneURL || "https://via.placeholder.com/150");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(firestore, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const uploadTansk = storage.ref(`images/${auth.currentUser.uid}`).put(image);
    uploadTansk.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        console.log(error);
      },
      () => {
        storage
          .ref("images")
          .child(auth.currentUser.uid)
          .getDownloadURL()
          .then((url) => {
            setUrl(url);
            auth.currentUser.uploadProfile({ photoURL: url });
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

  return (
    <div>
      <h2>Perfil</h2>
      {userData ? (
        <div>
          <p>Nombre: {userData.firstName} {userData.lastName}</p>
          <p>Edad: {userData.age}</p>
          <p>Género: {userData.gender}</p>
        </div>
      ) : (
        <p>Cargando información del usuario...</p>
      )}
      <p>Correo electrónico: {auth.currentUser.email}</p>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Subir Foto</button>
      <img src={url} alt="Profile" />
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Profile;
