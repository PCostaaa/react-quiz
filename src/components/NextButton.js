function NextButton({ dispatch, answer, index, numQuestions }) {
  return (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
      <button
        className="btn"
        onClick={() => dispatch({ type: "restart" })}
        style={{ float: "none" }}
      >
        Restart
      </button>

      {/* Back Button */}
      {index > 0 && (
        <button
          className="btn"
          onClick={() => dispatch({ type: "prevQuestion" })}
          style={{ float: "none" }}
        >
          Back
        </button>
      )}

      {/* Next/Finish Button */}
      {answer !== null && (
        <>
          {index < numQuestions - 1 && (
            <button
              className="btn btn-ui"
              onClick={() => dispatch({ type: "nextQuestion" })}
              style={{ float: "none" }}
            >
              Next
            </button>
          )}

          {index === numQuestions - 1 && (
            <button
              className="btn btn-ui"
              onClick={() => dispatch({ type: "finish" })}
              style={{ float: "none" }}
            >
              Finish
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default NextButton;
