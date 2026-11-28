import { useState } from "react";
import { loginWithEmail, loginWithGoogle } from "./authService";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(email, password);
    } catch {
      setError("Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
    } catch {
      setError("Google-kirjautuminen epäonnistui.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Kirjaudu sisään</h2>

      <label>
        Sähköposti
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label>
        Salasana
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>


      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Kirjaudutaan..." : "Kirjaudu"}
      </button>

      <button type="button" onClick={handleGoogleLogin} disabled={loading}>
        Kirjaudu Googlella
      </button>
    </form>
  );
}
