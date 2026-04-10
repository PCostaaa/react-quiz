import Options from "./Options";

function Question({ question, dispatch, answer }) {
  return (
    <div>
      <h4>{question.question}</h4>
      <p className="shortcut-hint">
        Desktop shortcuts: 1-4 answer, Enter/→ next, ← back, R restart
      </p>
      <Options question={question} dispatch={dispatch} answer={answer} />
    </div>
  );
}

export default Question;
