import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Connexion à Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Email ou mot de passe invalide.');
      return;
    }

    localStorage.setItem('supabaseToken', data.session?.access_token || '');
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Connexion Sécurisée</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Se connecter</button>
        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#000',
    color: '#FFD700',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 20,
    fontSize: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    width: '300px',
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  button: {
    padding: 10,
    fontSize: 16,
    backgroundColor: '#FFD700',
    color: '#000',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center' as const,
  },
};

export default Auth;