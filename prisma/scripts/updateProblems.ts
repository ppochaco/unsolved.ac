import { RANKS, TIERS } from '@/constant'
import { levelProblemApi } from '@/service/api'
import { SolvedAcProblem, Tier } from '@/types'

import { PrismaClient } from '../../src/generated/prisma'

const prisma = new PrismaClient()
const MAX_PAGE = 40

const rawTier = process.argv[2]

if (!isTier(rawTier)) {
  console.error('티어를 포함해서 다시 실행해주세요.(Silver, Gold, Platinum)')
  process.exit(1)
}

const tier = rawTier

async function upsertProblem(problem: SolvedAcProblem) {
  const level = await prisma.level.findUnique({
    where: { id: problem.level },
  })

  if (!level) {
    console.warn(
      `${problem.problemId}에서 Level ${problem.level}을(를) 찾을 수 없습니다.`,
    )
    return
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

  await upsertProblemTags(problem)
}

async function upsertProblemTags(problem: SolvedAcProblem) {
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

    const exists = await prisma.problemTag.findFirst({
      where: {
        problemId: problem.problemId,
        tagId: tagRecord.id,
      },
    })

    if (!exists) {
      await prisma.problemTag.create({
        data: {
          problemId: problem.problemId,
          tagId: tagRecord.id,
        },
      })
    }
  }
}

async function processTier(tier: Tier) {
  for (let i = 0; i < RANKS.length; i++) {
    const level = await prisma.level.findUnique({
      where: { name: `${tier} ${RANKS[i]}` },
    })

    if (!level) {
      console.warn(`${tier} ${RANKS[i]}을 Level에서 찾을 수 없습니다.`)
      return
    }

    for (let page = 1; page <= MAX_PAGE; page++) {
      const problems = await levelProblemApi({ value: level.id, page })

      if (problems.length === 0) break

      await Promise.all(problems.map((problem) => upsertProblem(problem)))
    }
  }
}

async function main() {
  await processTier(tier)
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

function isTier(value: unknown): value is Tier {
  return typeof value === 'string' && TIERS.includes(value as Tier)
}
