import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";

export async function createGameSession(db, user, codename) {
  const docRef = await addDoc(collection(db, "games"), {
    status: "waiting",
    currentRound: 1,
    maxRounds: 3,
    players: [
      {
        uid: user.uid,
        codename,
        score: 0,
        guess: null,
      },
    ],
    guesses: {},
    createdAt: new Date(),
  });

  return docRef.id;
}

export async function joinGameSession(db, gameId, user, codename) {
  const gameRef = doc(db, "games", gameId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(gameRef);

    if (!snapshot.exists()) {
      throw new Error("Peliä ei löydy.");
    }

    const game = snapshot.data();
    const players = game.players || [];

    if (game.status === "finished") {
      throw new Error("Tämä peli on jo päättynyt.");
    }

    if (players.some((player) => player.uid === user.uid)) {
      return { alreadyJoined: true };
    }

    if (players.length >= 4) {
      throw new Error("Peli on täynnä. Enimmäismäärä on 4 pelaajaa.");
    }

    const updatedPlayers = [
      ...players,
      {
        uid: user.uid,
        codename,
        score: 0,
        guess: null,
      },
    ];

    transaction.update(gameRef, {
      players: updatedPlayers,
      status: updatedPlayers.length >= 2 ? "playing" : "waiting",
    });

    return { alreadyJoined: false };
  });
}

export function listenToGameSession(db, gameId, onChange, onError) {
  const gameRef = doc(db, "games", gameId);

  return onSnapshot(
    gameRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onChange({ id: snapshot.id, ...snapshot.data() });
      } else {
        onChange(null);
      }
    },
    onError
  );
}