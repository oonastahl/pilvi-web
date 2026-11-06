import { useState } from "react";

function App() {
  const [codename, setCodename] = useState("");

  function login() {
    const savedName = localStorage.getItem("codename");

    if (savedName) {
      setCodename(savedName);
    } else {
      const adjectives = ["Sneaky", "Happy", "Brave"];
      const animals = ["Panda", "Bear", "Sloth"];
      const number = Math.floor(Math.random() * 100);

      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const animal = animals[Math.floor(Math.random() * animals.length)];
      const newName = adjective + animal + number;
      localStorage.setItem("codename", newName);
      setCodename(newName);
    }
  }

  return (
    <main>
      <h1>Minun hauska koodinimeni</h1>

      {codename ? (
        <p>Hei, {codename}!</p>
      ) : (
        <button onClick={login}>Kirjaudu sisään</button>
      )}
    </main>
  );
}

export default App;