import React, { useState } from "react";

export default function StartScreen({ numQuestions, dispatch }) {
  const [selectedCount, setSelectedCount] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  function handleStart() {
    dispatch({
      type: "start",
      payload: { numQuestions: selectedCount, difficulty: selectedDifficulty },
    });
  }

  const questionOptions = [5, 10, numQuestions];

  return (
    <div className="start">
      <h2>Welcome to The React Quiz</h2>
      <p>{numQuestions} Questions available to test your React mastery</p>

      {/* Number of Questions Selection */}
      <div className="selection-group">
        <h3>How many questions do you want to answer?</h3>
        <div className="selection-buttons">
          {questionOptions.map((count) => (
            <button
              key={count}
              className={`btn-selection ${selectedCount === count ? "active" : ""}`}
              onClick={() => setSelectedCount(count)}
            >
              {count === numQuestions ? "All" : count}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="selection-group">
        <h3>Choose difficulty level:</h3>
        <div className="selection-buttons">
          {[
            { value: "all", label: "All Levels" },
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ].map((difficulty) => (
            <button
              key={difficulty.value}
              className={`btn-selection ${
                selectedDifficulty === difficulty.value ? "active" : ""
              }`}
              onClick={() => setSelectedDifficulty(difficulty.value)}
            >
              {difficulty.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-ui"
        onClick={handleStart}
        style={{ marginTop: "2rem" }}
      >
        Let's Start
      </button>
    </div>
  );
}
