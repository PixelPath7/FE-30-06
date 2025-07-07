import { useState } from 'react'
import PokemonFetcher from './PokemonFetcher';
import './PokemonFetcher.css';

function App() {
  return (
    <>
      <h1>¡Conoce a tus Pokemon!</h1>
      <PokemonFetcher />
    </>
  );
}

export default App;
