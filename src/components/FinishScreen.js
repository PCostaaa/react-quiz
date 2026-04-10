function FinishScreen({
  points,
  maxPossiblePoints,
  highscore,
  dispatch,
  accuracy,
  bestStreak,
  quizMode,
  missedCount,
  onReviewMissed,
}) {
  const percentage = (points / maxPossiblePoints) * 100;

  let emoji = "😬";
  if (percentage === 100) emoji = "🥇";
  else if (percentage >= 80) emoji = "🎉";
  else if (percentage >= 50) emoji = "🙃";
  else if (percentage === 0) emoji = "🤦‍♂️";

  return (
    <>
      {quizMode === "review" && (
        <p className="review-badge">Review mode: missed questions only</p>
      )}
      <p className="result">
        <span>{emoji}</span>You scored <strong>{points}</strong> out of{" "}
        {maxPossiblePoints} ({Math.ceil(percentage)}%)
      </p>
      <p className="highscore">(Highscore: {highscore} points)</p>
      <p className="highscore">
        Accuracy: {accuracy}% | Best streak: {bestStreak}
      </p>

      <div className="finish-actions">
        {quizMode !== "review" && missedCount > 0 && (
          <button className="btn" onClick={onReviewMissed}>
            Review missed ({missedCount})
          </button>
        )}

        <button
          className="btn btn-ui"
          onClick={() => dispatch({ type: "restart" })}
        >
          Play again
        </button>
      </div>
    </>
  );
}

export default FinishScreen;
