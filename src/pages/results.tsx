import { type AsyncReturnType } from "@/utils/ts-bs";
import type { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import React from "react";
import Image from "next/image";

const getPokemonInOrder = async () => {
  const prisma = new PrismaClient();
  return await prisma.pokemon.findMany({
    select: {
      id: true,
      name: true,
      spriteUrl: true,
      _count: {
        select: {
          VoteFor: true,
          VoteAgainst: true,
        },
      },
    },
  });
};

type PokemonQueryResult = AsyncReturnType<typeof getPokemonInOrder>;

const generateCoutPercent = (pokemon: PokemonQueryResult[number]) => {
  const { VoteFor, VoteAgainst } = pokemon._count;

  if (VoteFor + VoteAgainst === 0) {
    return 0;
  }
  return (VoteFor / (VoteFor + VoteAgainst)) * 100;
};

const PokemonListing: React.FC<{ pokemon: PokemonQueryResult[number] }> = ({
  pokemon,
}) => {
  const pokemonPercatage = generateCoutPercent(pokemon);
  const bgColor = (percent: number) => {
    switch (true) {
      case percent > 75:
        return "bg-green-500";
      case percent > 40:
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <div
      className={`flex items-center justify-between border-b bg-opacity-60 p-2 ${bgColor(
        pokemonPercatage
      )}`}
    >
      <div className="flex items-center ">
        <Image
          width={128}
          height={128}
          src={pokemon.spriteUrl ?? ""}
          alt="Pokemon-first"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="capitalize ">{pokemon.name}</div>
      </div>
      <div className="pr-3">{`${Math.round(
        pokemonPercatage
      )}%`}</div>
    </div>
  );
};

const ResultsPage: React.FC<{ pokemon: PokemonQueryResult }> = (props) => {
  const sortPokemons = props.pokemon.sort(
    (a, b) => generateCoutPercent(b) - generateCoutPercent(a)
  );
  return (
    <div className="flex flex-col items-center">
      <h2 className="p-4 text-2xl">Results</h2>
      <div className="flex w-full max-w-2xl flex-col border">
        {sortPokemons.map((currentPokemon) => {
          return (
            <PokemonListing key={currentPokemon.id} pokemon={currentPokemon} />
          );
        })}
      </div>
    </div>
  );
};

export default ResultsPage;

export const getStaticProps: GetServerSideProps = async () => {
  const pokemonOrdered = await getPokemonInOrder();

  return { props: { pokemon: pokemonOrdered }, revalidate: 60 };
};
