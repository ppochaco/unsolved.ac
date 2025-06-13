import { tagListApi } from '@/service/api'

import { PrismaClient } from '../../src/generated/prisma'

const prisma = new PrismaClient()
async function main() {
  const tags = await tagListApi()

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { key: tag.key },
      update: {
        name: tag.displayNames[0].name,
        problemCount: tag.problemCount,
      },
      create: {
        key: tag.key,
        name: tag.displayNames[0].name,
        problemCount: tag.problemCount,
      },
    })
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
