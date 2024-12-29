import React, { useState, useEffect } from "react";

interface TimerProps {
  endTime: Date;
  color: string;
}

const LockupTimer: React.FC<TimerProps> = ({ color, endTime }) => {
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const getTimeDifference = (date1: string | Date, date2: string | Date) => {
    // Convert input to Date objects if they are strings
    const start = new Date(date1);
    const end = new Date(date2);

    // Get the difference in milliseconds
    let diffInMs = Math.abs(end.getTime() - start.getTime());

    // If the difference is negative, set it to 0
    if (diffInMs < 0) {
      diffInMs = 0;
    }

    // Convert the difference to hours, minutes, and seconds
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        const { hours, minutes, seconds } = getTimeDifference(
          endTime,
          new Date()
        );

        // Decrement logic
        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timer);
          return prevTime;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="timer-grid-box">
      <div className="timer-box">
        <p style={{ color }} className="text-20 font-medium">
          {time.hours.toString().padStart(2, "0")}
        </p>
        <span>시</span>
      </div>
      <span className="timer-separator">:</span>
      <div className="timer-box">
        <p style={{ color }} className="text-20 font-medium">
          {time.minutes.toString().padStart(2, "0")}
        </p>
        <span>분</span>
      </div>
      <span className="timer-separator">:</span>
      <div className="timer-box">
        <p style={{ color }} className="text-20 font-medium">
          {time.seconds.toString().padStart(2, "0")}
        </p>
        <span>초</span>
      </div>
    </div>
  );
};

export default LockupTimer;
