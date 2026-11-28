export function QuizForm({
  currentProduct,
  guess,
  onGuessChange,
  onFetchProduct,
  onSubmitGuess,
  canPlay,
}) {
  return (
    <section>
      <h2>Hintavisa</h2>

      <button onClick={onFetchProduct} disabled={!canPlay}>
        Hae tuote
      </button>

      <p>
        {currentProduct?.title || "Tuotetta ei ole vielä haettu"}
      </p>

      {currentProduct?.thumbnail && (
        <img
          src={currentProduct.thumbnail}
          alt={currentProduct.title}
          width="160"
        />
      )}

      {currentProduct && (
        <>
          <p>Arvaa tuotteen hinta:</p>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Hinta euroina"
            value={guess}
            onChange={(event) => onGuessChange(event.target.value)}
          />
          <button onClick={onSubmitGuess} disabled={!canPlay}>
            Vastaa
          </button>
        </>
      )}
    </section>
  );
}