import React, { useMemo, useState } from "react";

export default function StartScreen({
  numQuestions,
  questions,
  dispatch,
  errorMessage,
}) {
  const [selectedCount, setSelectedCount] = useState(
    Math.min(10, numQuestions),
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const availableForDifficulty = useMemo(() => {
    if (selectedDifficulty === "all") return numQuestions;
    return questions.filter((q) => q.difficulty === selectedDifficulty).length;
  }, [numQuestions, questions, selectedDifficulty]);

  const questionOptions = useMemo(
    () =>
      [...new Set([5, 10, numQuestions])]
        .filter((value) => value > 0)
        .sort((a, b) => a - b),
    [numQuestions],
  );

  const estimatedMinutes = Math.ceil(
    (Math.min(selectedCount, availableForDifficulty) * 30) / 60,
  );

  function handleStart() {
    dispatch({
      type: "start",
      payload: {
        numQuestions: selectedCount,
        difficulty: selectedDifficulty,
        shuffle: shuffleQuestions,
      },
    });
  }

  return (
    <div className="start">
      <h2>Welcome to The React Quiz</h2>
      <p>{numQuestions} Questions available to test your React mastery</p>

      {errorMessage && <p className="start-warning">{errorMessage}</p>}

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

      <label className="shuffle-toggle">
        <input
          type="checkbox"
          checked={shuffleQuestions}
          onChange={(e) => setShuffleQuestions(e.target.checked)}
        />
        Shuffle question order
      </label>

      <div className="start-stats">
        <p>
          Questions in this mode: <strong>{availableForDifficulty}</strong>
        </p>
        <p>
          Estimated time: <strong>{estimatedMinutes || 1} min</strong>
        </p>
      </div>

      <button
        className="btn btn-ui"
        onClick={handleStart}
        style={{ marginTop: "2rem" }}
        disabled={availableForDifficulty === 0}
      >
        Let's Start
      </button>
    </div>
  );
}
