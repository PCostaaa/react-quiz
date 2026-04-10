function Progress({
  index,
  numQuestions,
  points,
  maxPossiblePoints,
  answer,
  accuracy,
  streak,
  quizMode,
}) {
  return (
    <header className="progress">
      {quizMode === "review" && <p className="progress-mode">Review mode</p>}
      <progress max={numQuestions} value={index + Number(answer !== null)} />

      <p>
        Question{" "}
        <strong>
          {index + 1} / {numQuestions}
        </strong>
      </p>

      <p>
        <strong>{points}</strong> / {maxPossiblePoints}
      </p>

      <p>
        Accuracy <strong>{accuracy}%</strong>
      </p>

      <p>
        Streak <strong>{streak}</strong>
      </p>
    </header>
  );
}

export default Progress;
