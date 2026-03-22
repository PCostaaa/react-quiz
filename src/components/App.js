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
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
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

      return {
        ...state,
        status: "active",
        filteredQuestions: filtered,
        selectedNumQuestions: action.payload.numQuestions,
        selectedDifficulty: action.payload.difficulty,
        secondsRemaining: filtered.length * SECS_PER_QUESTION,
        answers: new Array(filtered.length).fill(null), // Initialize answers array
      };
    case "newAnswer":
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
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        highscore: state.highscore,
        status: "ready",
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
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
      index,
      answer,
      points,
      highscore,
      secondsRemaining,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  // Use filteredQuestions during active quiz, otherwise use all questions for display
  const activeQuestions = status === "active" ? filteredQuestions : questions;
  const numQuestions = activeQuestions.length;
  const maxPossiblePoints = activeQuestions.reduce(
    (prev, cur) => prev + cur.points,
    0,
  );

  // Fetch questions and highscore on mount
  useEffect(function () {
    fetch("http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));

    // Fetch highscore from API
    fetch("http://localhost:8000/highscore")
      .then((res) => res.json())
      .then((data) =>
        dispatch({ type: "highscoreLoaded", payload: data.highscore || 0 }),
      )
      .catch((err) => console.log("Highscore fetch failed"));
  }, []);

  // Save highscore when quiz finishes
  useEffect(
    function () {
      if (status === "finished" && highscore > 0) {
        fetch("http://localhost:8000/highscore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ highscore }),
        }).catch((err) => console.log("Highscore save failed"));
      }
    },
    [status, highscore],
  );

  return (
    <div className="app">
      <Header />

      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={activeQuestions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
                answers={answers}
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
          />
        )}
      </Main>
    </div>
  );
}
