import { levelProblemApi } from '@/service/api'
import { PrismaClient } from '../../src/generated/prisma'

const prisma = new PrismaClient()
async function main() {
  const problems = await levelProblemApi()

  for (const problem of problems) {
    const level = await prisma.level.findUnique({
      where: { value: problem.level },
    })

    if (!level) {
      console.warn(
        `${problem.problemId}에서 Level ${problem.level}을(를) 찾을 수 없습니다.`,
      )
      continue
    }

    await prisma.problem.upsert({
      where: { id: problem.problemId },
      update: {
        title: problem.titles[0].title,
        solvedCount: problem.acceptedUserCount,
      },
      create: {
        id: problem.problemId,
        title: problem.titles[0].title,
        solvedCount: problem.acceptedUserCount,
        levelId: level.id,
      },
    })

    for (const tag of problem.tags) {
      const tagRecord = await prisma.tag.findUnique({
        where: { key: tag.key },
      })

      if (!tagRecord) {
        console.warn(
          `${problem.problemId}에서 Tag ${tag.key}을 찾을 수 없습니다.`,
        )
        continue
      }

      const existing = await prisma.problemTag.findFirst({
        where: {
          problemId: problem.problemId,
          tagId: tagRecord.id,
        },
      })

      if (!existing) {
        await prisma.problemTag.create({
          data: {
            problemId: problem.problemId,
            tagId: tagRecord.id,
          },
        })
      }
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
