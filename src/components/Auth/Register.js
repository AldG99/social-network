import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firtName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firtName} ${lastName}`,
      });

      const birthdateObj = new Date(birthdate);
      const monthBirth = (birthdateObj.getMonth() + 1).toString().padStart(2, "0");
      const dayBirth = birthdateObj.getDate().toString().padStart(2, "0");
      const currentDate = new Date ();
      const monthRegister = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const dayRegister = currentDate.getDate().toString().padStart(2, "0");
      const yearRegister = currentDate.getFullYear().toString().slice(-2);
      const userId = `${firtName.slice(0, 2).toUpperCase()}${lastName.slice(0, 2).toUpperCase()}${monthBirth}${dayBirth}${country.slice(0, 2).toUpperCase()}${monthRegister}${dayRegister}${yearRegister}`;

      await setDoc(doc(firestore, "users", user.uid), {
        email,
        firtName,
        lastName,
        birthdate,
        country,
        userId,
        registrationDate: currentDate,
      });

      navigate("/profile");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Registro de Usuario</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        value={firtName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Nombre"
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Apellido"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo electrónico"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <input
        type="date"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
        placeholder="Fecha de Nacimiento"
      />
      <input
        type="text"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="País"
      />
      <button onClick={handleRegister}>Registrarse</button>
    </div>
  );
};

export default Register;
