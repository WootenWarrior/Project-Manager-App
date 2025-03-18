import React, { useState } from "react";
import { TimeInputProps } from "../utils/Interfaces";

const TimeInput: React.FC<TimeInputProps> = ({ onTimeChange, text, id }) => {
  const [selectedTime, setSelectedTime] = useState<string>("00:00");

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);
    onTimeChange(newTime);
  };

  return (
    <div className="time-input">
      <label htmlFor="time-input">{text}</label>
      <input
        id={id}
        type="time"
        value={selectedTime}
        onChange={handleTimeChange}
        className="time-input"
      />
    </div>
  );
};

export default TimeInput;