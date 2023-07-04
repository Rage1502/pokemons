import { trpc } from "@/utils/trpc";
import { getOptionsForVote } from "@/utils/getRandomPokemon";
import { useCallback, useEffect, useState } from "react";
import { type RouterOutput } from "./api/trpc/[trpc]";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [first, setFirst] = useState<number>(1);
  const [second, setSecond] = useState<number>(1);

  const generateRandomPokemon = useCallback(() => {
    const [first, second] = getOptionsForVote();

    if (first && second) {
      setFirst(first);
      setSecond(second);
    }
  }, []);

  useEffect(() => {
    generateRandomPokemon();
  }, [generateRandomPokemon]);

  const firstPokemon = trpc.getPokemon.useQuery({ id: first });
  const secondPokemon = trpc.getPokemon.useQuery({ id: second });

  const { mutate: voteMutation } = trpc.voteForPokemon.useMutation();

  const voteForRoundest = (selected: number) => {
    if (selected === first) {
      voteMutation({ votedFor: first, votedAgainst: second });
    } else {
      voteMutation({ votedFor: second, votedAgainst: first });
    }

    generateRandomPokemon();
  };

  if (firstPokemon.isLoading || secondPokemon.isLoading) {
    return <div>Loading</div>;
  }

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center ">
        <div className="text-center text-2xl"> Which Pokemon is Rounder?</div>
        <div className="p-2" />
        <div className="flex max-w-2xl items-center justify-between rounded border p-8">
          {!firstPokemon.isLoading &&
            firstPokemon.data &&
            !secondPokemon.isLoading &&
            secondPokemon.data && (
              <>
                <PokemonListing
                  pokemon={firstPokemon.data}
                  vote={() => voteForRoundest(first)}
                />
                <div className="p-8">VS</div>

                <PokemonListing
                  pokemon={secondPokemon.data}
                  vote={() => voteForRoundest(second)}
                />
              </>
            )}

          <div className="pb-10"></div>
        </div>
        <div className="absolute bottom-0 w-full pb-2 text-center text-xl">
          <Link href="/results">Results</Link>
        </div>
      </div>
    </>
  );
}

type PokemonFromServer = RouterOutput["getPokemon"];

const PokemonListing: React.FC<{
  pokemon: PokemonFromServer;
  vote: () => void;
}> = (props) => {
  return (
    <div className="flex flex-col items-center">
      <Image
        width={256}
        height={256}
        src={props.pokemon.spriteUrl ?? ""}
        alt="Pokemon-first"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="mt-[-2rem] text-center text-xl capitalize">
        {props.pokemon.name}
      </div>
      <button
        className="mt-4 inline-flex w-full justify-center rounded bg-red-500 px-2.5 py-1.5 text-xl font-medium text-white  shadow-sm duration-500 ease-in-out hover:bg-green-500 focus:right-2 focus:outline-none focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => props.vote()}
      >
        Rounder
      </button>
    </div>
  );
};
