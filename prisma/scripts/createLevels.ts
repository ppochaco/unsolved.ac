import { START_VALUE } from '../../src/constant'
import { PrismaClient } from '../../src/generated/prisma'

const prisma = new PrismaClient()
async function main() {
  const tier = ['Silver', 'Glod', 'Platinum']
  const rank = ['V', 'Ⅳ', 'Ⅲ', 'Ⅱ', 'I']
  let value = START_VALUE

  for (const cur_tier of tier) {
    for (const cur_rank of rank) {
      await prisma.level.create({
        data: {
          value,
          name: `${cur_tier} ${cur_rank}`,
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
