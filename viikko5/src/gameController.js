import { doc, runTransaction } from "firebase/firestore";

export async function scoreGameRound(db, gameId) {
  const gameRef = doc(db, "games", gameId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(gameRef);

    if (!snapshot.exists()) return;

    const game = snapshot.data();

    if (game.roundScored) return;

    const players = game.players || [];
    const guesses = game.guesses || {};

    const allPlayersHaveGuessed =
      players.length >= 2 &&
      players.every((player) => guesses[player.uid] !== undefined);

    if (!allPlayersHaveGuessed || game.correctPrice == null) return;

    const closestPlayer = [...players].sort((a, b) => {
      const aDifference = Math.abs(guesses[a.uid] - game.correctPrice);
      const bDifference = Math.abs(guesses[b.uid] - game.correctPrice);
      return aDifference - bDifference;
    })[0];

    const updatedPlayers = players.map((player) =>
      player.uid === closestPlayer.uid
        ? { ...player, score: (player.score || 0) + 1 }
        : player
    );

    transaction.update(gameRef, {
      players: updatedPlayers,
      roundScored: true,
    });
  });
}

export async function advanceGameRound(db, gameId) {
  const gameRef = doc(db, "games", gameId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(gameRef);

    if (!snapshot.exists()) return;

    const game = snapshot.data();

    if (!game.roundScored) return;

    if (game.currentRound >= game.maxRounds) {
      const winner = [...game.players].sort(
        (a, b) => b.score - a.score
      )[0];

      transaction.update(gameRef, {
        status: "finished",
        winnerCodename: winner?.codename || "",
      });

      return;
    }

    transaction.update(gameRef, {
      currentRound: game.currentRound + 1,
      guesses: {},
      correctPrice: null,
      currentProduct: null,
      roundScored: false,
      players: game.players.map((player) => ({
        ...player,
        guess: null,
      })),
    });
  });
}