function Error({ message, onRetry }) {
  return (
    <div className="error-box">
      <p className="error">
        <span>💥</span> {message || "There was an error fetching questions."}
      </p>
      <button className="btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export default Error;
