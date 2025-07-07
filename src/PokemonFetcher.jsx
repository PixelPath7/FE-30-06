import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css'; // Opcional: para estilos básicos

const tipoTraducido = {
  fuego: "fire",
  agua: "water",
  planta: "grass",
  eléctrico: "electric",
  hielo: "ice",
  lucha: "fighting",
  veneno: "poison",
  tierra: "ground",
  volador: "flying",
  psíquico: "psychic",
  bicho: "bug",
  roca: "rock",
  fantasma: "ghost",
  dragón: "dragon",
  siniestro: "dark",
  acero: "steel",
  hada: "fairy",
  normal: "normal"
};

const traducirTipo = (tipoUsuario) => {
  const tipo = tipoUsuario.toLowerCase();
  return tipoTraducido[tipo] || tipo; // Si no se encuentra, devuelve el original
};

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tipoBusqueda, setTipoBusqueda] = useState('');
  const [tipoActual, setTipoActual] = useState('');

  const fetchPokemones = async () => {
    try {
      setCargando(true);
      setError(null);
      setTipoActual('');
      const fetchedPokemones = [];
      const pokemonIds = new Set(); // Usar un Set para asegurar IDs únicos

      // Generar 6 IDs de Pokémon únicos aleatorios
      while (pokemonIds.size < 6) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        pokemonIds.add(randomId);
      }

      // Convertir el Set a un array para iterar
      const idsArray = Array.from(pokemonIds);

      for (const id of idsArray) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        if (!response.ok) {
          throw new Error(`Error al cargar el Pokémon con ID ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        fetchedPokemones.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(typeInfo => typeInfo.type.name),
        });
      }
      setPokemones(fetchedPokemones);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPokemones();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  const buscarPorTipo = async (tipo) => {
    if (!tipo.trim()) {
      alert("Por favor, ingresa un tipo de Pokémon válido");
      return;
    }
    try {
      setCargando(true);
      setError(null);
      const tipoTraducido = traducirTipo(tipo);
      const response = await fetch(`https://pokeapi.co/api/v2/type/${tipoTraducido}`);

      if (!response.ok) {
        throw new Error(`Tipo "${tipo}" no encontrado`);
      }
      const data = await response.json();

      const pokemonesDelTipo = data.pokemon; // Muestra todos los de la base de datos de la API

      const detalles = await Promise.all(
        pokemonesDelTipo.map(async (poke) => {
          const res = await fetch(poke.pokemon.url);
          const info = await res.json();
          return {
            id: info.id,
            nombre: info.name,
            imagen: info.sprites.front_default,
            tipos: info.types.map((t) => t.type.name),
          };
        })
      );

      setPokemones(detalles);
      setTipoActual(tipo);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="pokemon-container">Cargando Pokémones...</div>;
  }

  if (error) {
    return <div className="pokemon-container error">Error: {error}</div>;
  }

  return (
    <>
      {/* Contenedor superior*/}
      <div className="top-controls">
        <button onClick={fetchPokemones}>Volver a generar aleatorios</button>
        <input
          type="text"
          placeholder="Buscar por tipo (ej. fire, water)"
          value={tipoBusqueda}
          onChange={(e) => setTipoBusqueda(e.target.value.toLowerCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              buscarPorTipo(tipoBusqueda);
              setTipoBusqueda('');
            }
          }}
        />
        <button onClick={() => {
          buscarPorTipo(tipoBusqueda);
          setTipoBusqueda('');
        }}
        >Buscar</button>
      </div>

      <div className='pokemon-container'>
        <h2>
          {tipoActual
            ? `Tus Pokémones de Tipo ${tipoActual.charAt(0).toUpperCase() + tipoActual.slice(1)}`
            : 'Tus 6 Pokémon Aleatorios'}
        </h2>
        <div className="pokemon-list">
          {pokemones.map(pokemon => (
            <div key={pokemon.id} className="pokemon-card">
              <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
              <img src={pokemon.imagen} alt={pokemon.nombre} />
              <div className="tipo-container">
                <span className="tipo-label">Type</span>
                <div className="tipo-valor-multiple">
                  {pokemon.tipos.map(type => (
                    <span key={type} className={`tipo-valor tipo-${type}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    ))}
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PokemonFetcher;