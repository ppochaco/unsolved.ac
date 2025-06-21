import type { UserProblemIds } from '@/types'

type ProblemColor = 'black' | 'gray' | 'purple'

export class StyleService {
  public static applyColors(userProblemIds: UserProblemIds[]) {
    this.resetAllStyles()

    const table = document.querySelector('table')
    if (!table) return

    const links = table.querySelectorAll('tr td:first-child a')
    if (!links.length) return

    const { unionSet, intersectionSet } = this.calculateSets(userProblemIds)

    links.forEach((link) => {
      const href = link.getAttribute('href')
      if (!href) return

      const match = href.match(/\/problem\/(\d+)/)
      if (!match) return

      const problemId = parseInt(match[1])
      let color: ProblemColor

      if (unionSet.has(problemId)) {
        color = intersectionSet.has(problemId) ? 'black' : 'gray'
      } else {
        color = 'purple'
      }

      this.applyColorStyle(link as HTMLElement, color)
    })
  }

  private static calculateSets(userProblemIds: UserProblemIds[]) {
    const unionSet = new Set(
      userProblemIds.flatMap(({ problemIds }) => problemIds),
    )
    let intersectionSet = new Set<number>()

    if (userProblemIds.length === 0) {
      return { unionSet, intersectionSet }
    }

    intersectionSet = new Set(userProblemIds[0].problemIds)

    for (let i = 1; i < userProblemIds.length; i++) {
      const currentSet = new Set(userProblemIds[i].problemIds)
      intersectionSet = new Set(
        [...intersectionSet].filter((id) => currentSet.has(id)),
      )
    }

    return { unionSet, intersectionSet }
  }

  private static applyColorStyle(link: HTMLElement, color: ProblemColor) {
    if (link.dataset.unsolvedacColor === color) {
      return
    }

    link.dataset.unsolvedacColor = color
    link.style.setProperty('font-weight', 'bold', 'important')
    link.style.setProperty('color', colors[color], 'important')
  }

  public static resetAllStyles() {
    const styledLinks = document.querySelectorAll('[data-unsolvedac-color]')

    styledLinks.forEach((link) => {
      const htmlLink = link as HTMLElement
      htmlLink.style.removeProperty('font-weight')
      htmlLink.style.removeProperty('color')
      htmlLink.removeAttribute('data-unsolvedac-color')
    })
  }
}

const colors: Record<ProblemColor, string> = {
  black: '#1f132e',
  gray: '#a39ea9',
  purple: '#904eee',
}
