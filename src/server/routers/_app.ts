import { z } from "zod";
import { procedure, router } from "@/server/trcp";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const appRouter = router({
  getPokemon: procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async (opts) => {
      const pokemon = await prisma.pokemon.findFirst({where:{id: opts.input.id}});

      if (!pokemon) throw new Error("lol doesn`t exist")

      return pokemon;
    }),
  voteForPokemon: procedure
    .input(
      z.object({
        votedFor: z.number(),
        votedAgainst: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const voteDB = await prisma.vote.create({
        data: {
          votedAgainstId: input.votedAgainst,
          votedForId: input.votedFor,
        },
      });

      return { succes: true, vote: voteDB };
    }),
});

export type AppRouter = typeof appRouter;
