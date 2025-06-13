import { RANKS, TIERS } from '../../src/constant'
import { PrismaClient } from '../../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  let id = 0
  for (const tier of TIERS) {
    const ranks = tier === 'Unrated' || tier === 'Master' ? [''] : RANKS

    for (const rank of ranks) {
      const name = `${tier}${rank ? ` ${rank}` : ''}`
      const imageUrl = `https://static.solved.ac/tier_small/${id}.svg`

      await prisma.level.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name,
          imageUrl,
        },
      })

      id++
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
