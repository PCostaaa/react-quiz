import { useEffect, useReducer } from "react";

import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Footer from "./Footer";
import Timer from "./Timer";

const SECS_PER_QUESTION = 30;
const HIGHSCORE_KEY = "react-quiz-highscore";

function normalizeCollectionResponse(json) {
  return Array.isArray(json) ? json : (json?.data ?? []);
}

function shuffleArray(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateStreaks(answers, questions) {
  let currentStreak = 0;
  let bestStreak = 0;

  answers.forEach((answer, index) => {
    if (answer === null) {
      currentStreak = 0;
      return;
    }

    const isCorrect = answer === questions[index]?.correctOption;

    if (isCorrect) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return { currentStreak, bestStreak };
}

const initialState = {
  questions: [],
  filteredQuestions: [],
  answers: [], // Array to store user answers

  // Loading, Error, Ready, Active, Finished
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
  selectedNumQuestions: null,
  selectedDifficulty: "all",
  selectedShuffle: false,
  quizMode: "normal",
  errorMessage: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        status: "loading",
        errorMessage: "",
      };
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
        errorMessage: "",
      };
    case "highscoreLoaded":
      return {
        ...state,
        highscore: action.payload,
      };
    case "dataFailed":
      return {
        ...state,
        status: "error",
        errorMessage: action.payload,
      };
    case "start":
      // Filter questions by difficulty
      let filtered = state.questions;
      if (action.payload.difficulty !== "all") {
        filtered = filtered.filter(
          (q) => q.difficulty === action.payload.difficulty,
        );
      }
      // Limit to selected number of questions
      const numQuest = Math.min(action.payload.numQuestions, filtered.length);
      filtered = filtered.slice(0, numQuest);

      if (action.payload.shuffle) {
        filtered = shuffleArray(filtered);
      }

      if (!filtered.length) {
        return {
          ...state,
          status: "ready",
          errorMessage:
            "No questions found for this difficulty. Try another filter.",
        };
      }

      return {
        ...state,
        status: "active",
        quizMode: "normal",
        filteredQuestions: filtered,
        selectedNumQuestions: action.payload.numQuestions,
        selectedDifficulty: action.payload.difficulty,
        selectedShuffle: action.payload.shuffle,
        secondsRemaining: filtered.length * SECS_PER_QUESTION,
        answers: new Array(filtered.length).fill(null), // Initialize answers array
        index: 0,
        answer: null,
        points: 0,
        errorMessage: "",
      };
    case "startReview":
      return {
        ...state,
        status: "active",
        quizMode: "review",
        filteredQuestions: action.payload,
        answers: new Array(action.payload.length).fill(null),
        secondsRemaining: action.payload.length * SECS_PER_QUESTION,
        index: 0,
        answer: null,
        points: 0,
        errorMessage: "",
      };
    case "newAnswer":
      if (state.answer !== null) return state;
      const question = state.filteredQuestions.at(state.index);
      const newAnswers = [...state.answers];
      newAnswers[state.index] = action.payload;
      return {
        ...state,
        answer: action.payload,
        answers: newAnswers,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "prevQuestion":
      return {
        ...state,
        index: state.index - 1,
        answer: state.answers[state.index - 1],
      };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.quizMode === "normal" && state.points > state.highscore
            ? state.points
            : state.highscore,
      };
    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        highscore: state.highscore,
        status: "ready",
      };
    case "tick":
      const nextSeconds = state.secondsRemaining - 1;
      return {
        ...state,
        secondsRemaining: nextSeconds,
        status: nextSeconds <= 0 ? "finished" : state.status,
      };

    default:
      throw new Error("Action unknown");
  }
}

export default function App() {
  const [
    {
      questions,
      filteredQuestions,
      answers,
      status,
      quizMode,
      index,
      answer,
      points,
      highscore,
      secondsRemaining,
      errorMessage,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const quizQuestions = status === "ready" ? questions : filteredQuestions;
  const activeQuestion = quizQuestions[index];
  const numQuestions = quizQuestions.length;
  const maxPossiblePoints = quizQuestions.reduce(
    (prev, cur) => prev + cur.points,
    0,
  );
  const answeredCount = answers.filter((ans) => ans !== null).length;
  const correctCount = answers.reduce((count, ans, i) => {
    if (ans === null) return count;
    return ans === filteredQuestions[i]?.correctOption ? count + 1 : count;
  }, 0);
  const accuracy = answeredCount
    ? Math.round((correctCount / answeredCount) * 100)
    : 0;
  const { currentStreak, bestStreak } = calculateStreaks(
    answers,
    quizQuestions,
  );
  const missedQuestions = filteredQuestions.filter(
    (question, questionIndex) =>
      answers[questionIndex] !== question.correctOption,
  );

  useEffect(
    function () {
      if (status !== "active") return;

      function handleKeyDown(e) {
        const isDesktop = window.innerWidth >= 1024;
        if (!isDesktop) return;

        const tagName = e.target?.tagName;
        if (
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT"
        )
          return;

        const hasAnswered = answer !== null;

        if (e.key >= "1" && e.key <= "9" && !hasAnswered && activeQuestion) {
          const optionIndex = Number(e.key) - 1;
          if (optionIndex < activeQuestion.options.length) {
            e.preventDefault();
            dispatch({ type: "newAnswer", payload: optionIndex });
          }
          return;
        }

        if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          dispatch({ type: "restart" });
          return;
        }

        if (e.key === "ArrowLeft" && index > 0) {
          e.preventDefault();
          dispatch({ type: "prevQuestion" });
          return;
        }

        const isForwardKey = e.key === "ArrowRight" || e.key === "Enter";
        if (!isForwardKey || !hasAnswered) return;

        e.preventDefault();
        if (index < numQuestions - 1) dispatch({ type: "nextQuestion" });
        else dispatch({ type: "finish" });
      }

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    },
    [status, answer, activeQuestion, index, numQuestions, dispatch],
  );

  function loadQuestions() {
    dispatch({ type: "loading" });
    fetch("http://localhost:8000/questions")
      .then((res) => {
        if (!res.ok) throw new Error("Question fetch failed");
        return res.json();
      })
      .then((json) => {
        const questions = normalizeCollectionResponse(json);
        dispatch({ type: "dataReceived", payload: questions });
      })
      .catch(() =>
        dispatch({
          type: "dataFailed",
          payload:
            "Could not load quiz data. Start json-server with npm run server and try again.",
        }),
      );
  }

  // Fetch questions and highscore on mount
  useEffect(function () {
    loadQuestions();

    const savedHighscore = Number(localStorage.getItem(HIGHSCORE_KEY) || 0);
    dispatch({ type: "highscoreLoaded", payload: savedHighscore });
  }, []);

  // Persist highscore locally instead of posting to a missing API endpoint
  useEffect(
    function () {
      if (highscore > 0) localStorage.setItem(HIGHSCORE_KEY, String(highscore));
    },
    [highscore],
  );

  return (
    <div className="app">
      <Header />

      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && (
          <Error message={errorMessage} onRetry={loadQuestions} />
        )}
        {status === "ready" && (
          <StartScreen
            numQuestions={numQuestions}
            questions={questions}
            dispatch={dispatch}
            errorMessage={errorMessage}
          />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
              accuracy={accuracy}
              streak={currentStreak}
              quizMode={quizMode}
            />
            <Question
              question={activeQuestion}
              dispatch={dispatch}
              answer={answer}
              quizMode={quizMode}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
            accuracy={accuracy}
            bestStreak={bestStreak}
            quizMode={quizMode}
            missedCount={missedQuestions.length}
            onReviewMissed={() =>
              dispatch({ type: "startReview", payload: missedQuestions })
            }
          />
        )}
      </Main>
    </div>
  );
}
