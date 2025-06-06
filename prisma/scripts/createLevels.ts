import { RANKS, TIER_DISPLAY_NAME, TIER_START_VALUE, TIERS } from '@/constant'
import { PrismaClient } from '../../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  let value = TIER_START_VALUE['SILVER']

  for (const tier of TIERS) {
    for (const rank of RANKS) {
      await prisma.level.create({
        data: {
          value,
          name: `${TIER_DISPLAY_NAME[tier]} ${rank}`,
          imageUrl: `https://static.solved.ac/tier_small/${value}.svg`,
        },
      })

      value++
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
