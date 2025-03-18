import React, { useState } from "react";
import { DateInputProps } from "../utils/Interfaces";

const DateInput: React.FC<DateInputProps> = ({ onDateChange, text, displayDate, id }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  return (
    <div className="date-input">
      <label htmlFor="date-input">{text}</label>
      <input
        id={id}
        type="date"
        value={displayDate ? displayDate : selectedDate}
        onChange={handleDateChange}
        className="date-input"
      />
    </div>
  );
};

export default DateInput;