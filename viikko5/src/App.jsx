import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, db } from "./firebaseConfig";
import { logout } from "./authService";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { RoundResult } from "./components/RoundResult";
import { QuizForm } from "./components/QuizForm";
import { createGameSession, joinGameSession, listenToGameSession } from "./gameSessionService";
import { advanceGameRound, scoreGameRound } from "./gameController";

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
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState(null);
  const [gameId, setGameId] = useState("");
  const [gameStatus, setGameStatus] = useState("");
  const [gameData, setGameData] = useState(null);
  const [joinGameId, setJoinGameId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCodename(firebaseUser ? getOrCreateCodename(firebaseUser.uid) : "");
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

useEffect(() => {
  if (!gameId) return;

  const unsubscribe = listenToGameSession(
    db,
    gameId,
    (game) => {
      if (game) {
        setGameData(game);
        setGameStatus(game.status);
      } else {
        setGameData(null);
        setGameStatus("");
      }
    },
    (error) => {
      console.error("Pelin kuuntelu epäonnistui:", error);
      setMessage("Pelin tietojen haku epäonnistui.");
    }
  );

  return unsubscribe;
}, [gameId]);

  function checkGuess() {
  if (!product || guess === "") {
    setMessage("Hae ensin tuote ja kirjoita arvaus.");
    return;
  }

  const difference = Math.abs(Number(guess) - product.price);
  setMessage(
    `Oikea hinta oli ${product.price} €. Arvauksesi heitti ${difference.toFixed(2)} €.`
  );
}

async function createGame() {
  setMessage("");

  try {
    const newGameId = await createGameSession(db, user, codename);

    setGameId(newGameId);
    alert(`Peli luotu. Pelin tunnus: ${newGameId}`);
  } catch (error) {
    console.error(error);
    alert("Pelin luominen epäonnistui.");
  }
}

async function loadGame() {
  try {
    const gameRef = doc(db, "games", gameId);
    const gameSnapshot = await getDoc(gameRef);

    if (gameSnapshot.exists()) {
      const game = gameSnapshot.data();
      setGameStatus(game.status);
    } else {
      alert("Peliä ei löytynyt.");
    }
  } catch (error) {
    console.error(error);
    alert("Pelin haku epäonnistui.");
  }
}

  async function handleFetchProduct() {
    try {
      const response = await fetch("https://dummyjson.com/products");
      const data = await response.json();
      const randomIndex = Math.floor(Math.random() * data.products.length);
      const selectedProduct = data.products[randomIndex];
setProduct(selectedProduct);

if (gameId) {
  await updateDoc(doc(db, "games", gameId), {
    currentProduct: {
      title: selectedProduct.title,
      thumbnail: selectedProduct.thumbnail
    },
    correctPrice: selectedProduct.price
  });
}
      setGuess("");
      setMessage("");
    } catch (error) {
      console.error("Tuotteen haku epäonnistui:", error);
    }
  }

  async function submitGuess() {
  if (!gameId || !user || guess === "") {
    setMessage("Luo ensin peli ja kirjoita arvaus.");
    return;
  }

  try {
    await updateDoc(doc(db, "games", gameId), {
      [`guesses.${user.uid}`]: Number(guess)
    });

    setMessage("Arvaus tallennettu!");
  } catch (error) {
    console.error(error);
    setMessage("Arvauksen tallennus epäonnistui.");
  }
}

  if (checkingAuth) {
    return <p>Tarkistetaan kirjautumista...</p>;
  }

async function joinGame() {
  const id = joinGameId.trim();

  if (!user || !id) {
    setMessage("Kirjoita ensin pelin tunnus.");
    return;
  }

  try {
    const result = await joinGameSession(db, id, user, codename);

    setGameId(id);
    setMessage(
      result.alreadyJoined ? "Olet jo tässä pelissä." : "Liityit peliin!"
    );
  } catch (error) {
    console.error("Peliin liittyminen epäonnistui:", error);
    setMessage(error.message || "Peliin liittyminen epäonnistui.");
  }
}

async function scoreRound() {
  try {
    await scoreGameRound(db, gameId);
  } catch (error) {
    console.error("Pisteen tallentaminen epäonnistui:", error);
    setMessage("Pisteen tallentaminen epäonnistui.");
  }
}

async function nextRound() {
  try {
    await advanceGameRound(db, gameId);
  } catch (error) {
    console.error("Seuraavan kierroksen aloitus epäonnistui:", error);
    setMessage("Seuraavan kierroksen aloitus epäonnistui.");
  }
}

const guesses = gameData?.guesses || {};
const players = gameData?.players || [];
const allPlayersGuessed =
  players.length >= 2 &&
  Object.keys(guesses).length >= players.length;

  return (
    <main>
      <h1>Minun hauska koodinimeni</h1>

      {user ? (
        <>
          <p>Kirjautunut käyttäjänä: {user.email}</p>
          <p>Tervetuloa, {codename}!</p>
          
          <QuizForm
            currentProduct={gameData?.currentProduct}
            guess={guess}
            onGuessChange={setGuess}
            onFetchProduct={handleFetchProduct}
            onSubmitGuess={submitGuess}
            canPlay={
              Boolean(gameId) &&
              (gameData?.players?.length ?? 0) >= 2 &&
              gameStatus === "playing"
            }
          />

            <button onClick={createGame}>Luo peli</button>
            <input
              value={joinGameId}
              onChange={(event) => setJoinGameId(event.target.value)}
              placeholder="Pelin tunnus"
            />
            <button onClick={joinGame}>Liity peliin</button>
            <button onClick={loadGame} disabled={!gameId}>
              Hae luodun pelin tiedot
            </button>
            {gameStatus && <p>Pelin tila: {gameStatus}</p>}
            {gameStatus === "waiting" && (
              <p>Odotetaan vähintään toista pelaajaa.</p>
            )}
            {message && <p>{message}</p>}
            {gameData?.guesses && (
  <div>
    <h3>Tallennetut arvaukset</h3>
    <ul>
      {Object.entries(gameData.guesses).map(([uid, value]) => {
        const player = gameData.players.find((item) => item.uid === uid);

        return (
          <li key={uid}>
            {player ? player.codename : "Pelaaja"}: {value} €
          </li>
        );
      })}
    </ul>
  </div>
)}

{allPlayersGuessed && (
  <RoundResult
    players={players}
    guesses={guesses}
    correctPrice={gameData.correctPrice}
    roundScored={gameData.roundScored}
    currentRound={gameData.currentRound}
    maxRounds={gameData.maxRounds}
    onScoreRound={scoreRound}
    onNextRound={nextRound}
  />
)}

{gameData?.status === "finished" && (
  <section>
    <h2>Peli päättyi</h2>
    <p>Voittaja: {gameData.winnerCodename}</p>
  </section>
)}

        </>
      ) : (
        <LoginForm />
      )}
    </main>
  );
}