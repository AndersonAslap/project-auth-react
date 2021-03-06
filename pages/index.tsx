import { GetServerSideProps } from 'next';
import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext';
import { parseCookies } from 'nookies';
import styles from '../styles/Home.module.css';
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { singIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await singIn({ email, password })
  }

  return (
    <div className={styles.content}>
      <form className={styles.form} onSubmit={handleSubmit}>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}


export const getServerSideProps: GetServerSideProps = withSSRGuest(async (context) => {
  return {
    props: {

    }
  }
})