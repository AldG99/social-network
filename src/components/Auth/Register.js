import React, { useState } from "react";
import { auth, db, storage } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const displayName = e.target[0].value;
    const lastName = e.target[1].value;
    const birthDate = e.target[2].value;
    const gender = e.target[3].value;
    const email = e.target[4].value;
    const password = e.target[5].value;
    const file = e.target[6].files[0];

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              lastName,
              birthDate,
              gender,
              email,
              photoURL: downloadURL,
            });
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (err) {
            setErr(true);
            setLoading(false);
          }
        });
      });
    } catch (err) {
      setErr(true);
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chat</span>
        <span className="title">Registrarse</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="Nombre" />
          <input required type="text" placeholder="Apellido" />
          <input required type="date" placeholder="Fecha de nacimiento" />
          <select required name="gender">
            <option value="">Género</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Otro">Otro</option>
          </select>
          <input required type="email" placeholder="Correo Electrónico" />
          <input required type="password" placeholder="Contraseña" />
          <input required style={{display: "none" }} type="file" id="file" />
          <label htmlFor="file">
            <span>Agregar un Perfil</span>
          </label>
          <button disabled={loading}>Regístrate</button>
          {loading && "Cargando y comprimiendo la imagen por favor espere..."}
          {err && <span>Algo salió mal</span>}
        </form>
        <p>
          ¿Tienes una cuenta? <Link to="/register">Acceso</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
