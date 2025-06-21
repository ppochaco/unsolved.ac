import { DotFilledIcon } from '@radix-ui/react-icons'

import { cn } from '@/libs'

export const SolvedStatusList = () => {
  return (
    <ul className="flex justify-center gap-4 text-sm">
      {SOLVED_STATES.map(({ label, textColor, dotColor }) => (
        <li key={label} className={cn('flex items-center gap-1', textColor)}>
          <DotFilledIcon className={cn('size-2.5 rounded-full', dotColor)} />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}

const SOLVED_STATES = [
  {
    label: '모두 unsolved',
    textColor: 'text-primary',
    dotColor: 'bg-primary',
  },
  {
    label: '일부 unsolved',
    textColor: 'text-plum-400',
    dotColor: 'bg-plum-400',
  },
  {
    label: '모두 solved',
    textColor: '',
    dotColor: 'bg-plum-950',
  },
] as const
