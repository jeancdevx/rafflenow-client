import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  endDate: string
  onExpire?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const calculateTimeLeft = (endDate: string): TimeLeft => {
  const difference = new Date(endDate).getTime() - new Date().getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  }
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className='flex flex-col items-center flex-1'>
      <span className='text-3xl md:text-5xl font-bold tabular-nums'>
        {value.toString().padStart(2, '0')}
      </span>
      <span className='text-xs text-muted-foreground'>{label}</span>
    </div>
  )
}

const CountdownTimer = ({ endDate, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(endDate)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endDate)
      setTimeLeft(newTimeLeft)

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate, onExpire])

  return (
    <div className='space-y-2'>
      <p className='text-sm text-muted-foreground'>Termina en:</p>
      <div className='flex gap-2 w-full'>
        <TimeUnit
          value={timeLeft.days}
          label='Días'
        />
        <TimeUnit
          value={timeLeft.hours}
          label='Horas'
        />
        <TimeUnit
          value={timeLeft.minutes}
          label='Minutos'
        />
        <TimeUnit
          value={timeLeft.seconds}
          label='Segundos'
        />
      </div>
    </div>
  )
}

export { CountdownTimer }
