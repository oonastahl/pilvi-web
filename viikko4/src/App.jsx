import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth } from "./firebaseConfig";
import { logout } from "./authService";

const adjectives = ["Sneaky", "Happy", "Brave"];
const animals = ["Panda", "Bear", "Sloth"];

function getOrCreateCodename(uid) {
  const key = `codename_${uid}`;
  const savedName = localStorage.getItem(key);

  if (savedName) {
    return savedName;
  }

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100);
  const newName = `${adjective}${animal}${number}`;

  localStorage.setItem(key, newName);
  return newName;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [codename, setCodename] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCodename(firebaseUser ? getOrCreateCodename(firebaseUser.uid) : "");
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return <p>Tarkistetaan kirjautumista...</p>;
  }

  return (
    <main>
      <h1>Minun hauska koodinimeni</h1>

      {user ? (
        <>
          <p>Kirjautunut käyttäjänä: {user.email}</p>
          <p>Tervetuloa, {codename}!</p>
          <button onClick={logout}>Kirjaudu ulos</button>
        </>
      ) : (
        <LoginForm />
      )}
    </main>
  );
}