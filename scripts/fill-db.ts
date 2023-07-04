import { PrismaClient } from "@prisma/client";
import { PokemonClient } from "pokenode-ts";

const prisma = new PrismaClient();

const doBackfill = async () => {
  const pokeApi = new PokemonClient();

  const allPokemon = await pokeApi.listPokemons(0, 493);

  const formattedPokemon = allPokemon.results.map((p, index) => ({
    id: index + 1,
    name: p.name,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
      index + 1
    }.png`,
  }));

  console.log(formattedPokemon);
  
  const pokemonsPromises = formattedPokemon.map( (poke) => {
    return prisma.pokemon.create({
       data: {
         id: poke.id,
         spriteUrl: poke.spriteUrl,
         name: poke.name
       }
     })
   })

  const creation = await Promise.all(pokemonsPromises);

  console.log(creation)

  };

void doBackfill();
