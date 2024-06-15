import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firtName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("null");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, "users", user.uid), {
        firtName,
        lastName,
        age: Number(age),
        gender,
        email
      });

      console.log("Usuario registrado:", user);
      setError(null);
      navigate("/profile");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está en uso. Intente con otro correo o inicie sesión.");
      } else {
        setError(error.massage);
      }
    }
  };

  return (
    <div>
      <h2>Registro de Usuario</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
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
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="Edad"
      />
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">Seleccione Género</option>
        <option value="male">Masculino</option>
        <option value="female">Femenino</option>
        <option value="other">Otro</option>
      </select>
      <button onClick={handleRegister}>Registrarse</button>
    </div>
  );
};

export default Register;
