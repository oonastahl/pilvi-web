export function RoundResult({
  players,
  guesses,
  correctPrice,
  roundScored,
  currentRound,
  maxRounds,
  onScoreRound,
  onNextRound,
}) {
  return (
    <section>
      <h2>Kierroksen tulos</h2>
      <p>Oikea hinta: {correctPrice} €</p>

      <ul>
        {players.map((player) => {
          const playerGuess = guesses[player.uid];

          return (
            <li key={player.uid}>
              {player.codename}: {playerGuess} €
              {" — ero "}
              {Math.abs(playerGuess - correctPrice).toFixed(2)} €
              {" — pisteet: "}
              {player.score}
            </li>
          );
        })}
      </ul>

      <button onClick={onScoreRound} disabled={roundScored}>
        {roundScored ? "Piste annettu" : "Anna piste lähimmälle"}
      </button>

      {roundScored && (
        <button onClick={onNextRound}>
          {currentRound < maxRounds ? "Seuraava kierros" : "Päätä peli"}
        </button>
      )}
    </section>
  );
}