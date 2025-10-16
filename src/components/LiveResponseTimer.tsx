import { useState, useEffect } from 'react';

interface LiveResponseTimerProps {
  startTime: Date;
  isPending: boolean;
  finalTime?: number;
}

export function LiveResponseTimer({ startTime, isPending, finalTime }: LiveResponseTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.getTime();
      setElapsedTime(elapsed);
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [isPending, startTime]);

  const displayTime = isPending ? elapsedTime : (finalTime || 0);

  return (
    <span className={isPending ? 'response-time-pending' : ''}>
      {displayTime.toFixed(2)}
    </span>
  );
}
