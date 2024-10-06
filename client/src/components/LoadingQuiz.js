import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Timer, Award } from 'lucide-react';
import axios from 'axios';
import './LoadingQuiz.css'

const LoadingQuiz = ({ topic }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const number_of_questions = 5;

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('http://localhost:8080/api/get-quiz', {
                topic,
                number_of_questions
            });

            const shuffledQuestions = response.data.map(question => ({
                ...question,
                all_answers: shuffleArray([...question.all_answers])
            }));

            setQuestions(prevQuestions => [...prevQuestions, ...shuffledQuestions]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [topic, number_of_questions]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleAnswerSelect = (answer) => {
        if (showFeedback) return;

        setSelectedAnswer(answer);
        setShowFeedback(true);

        if (answer === questions[currentQuestion].correct_answer) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowFeedback(false);
            } else {
                // If we've reached the end of the current questions, fetch more
                fetchQuestions();
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowFeedback(false);
            }
        }, 1500);
    };

    if (loading && questions.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <Timer className="animate-spin mr-2" />
                <p>Loading questions for {topic}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">No questions found!</strong>
                <span className="block sm:inline"> Unable to find questions for the topic: {topic}. Please try a different topic.</span>
            </div>
        );
    }

    if (quizCompleted) {
        return (
            <div className="w-full max-w-2xl mx-auto my-4">
                <div className="bg-gray-100 rounded-lg p-6 shadow-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
                    <p className="text-xl">Final Score: {score} out of {currentQuestion}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto my-4">
            <div className="bg-gray-100 rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Quiz on {topic}</h2>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">
                        Question {currentQuestion + 1}
                    </span>
                    <div className="flex items-center gap-2">
                        <Award className="text-yellow-500" />
                        <span className="font-bold">Score: {score}</span>
                    </div>
                </div>

                {currentQuestion < questions.length ? (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">
                            {questions[currentQuestion]?.question}
                        </h3>

                        <div className="space-y-3">
                            {questions[currentQuestion]?.all_answers.map((answer, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(answer)}
                                    className={`w-full p-3 text-left rounded-lg transition-colors
                                        ${showFeedback
                                            ? answer === questions[currentQuestion].correct_answer
                                                ? 'bg-green-100 border-green-500'
                                                : answer === selectedAnswer
                                                    ? 'bg-red-100 border-red-500'
                                                    : 'bg-white border-gray-200'
                                            : 'bg-white hover:bg-gray-50 border-gray-200'
                                        } border`}
                                    disabled={showFeedback}
                                >
                                    <div className="flex items-center justify-between">
                                        <span style={{color: "black !important"}} className='options'>{answer}</span>
                                        {showFeedback && answer === questions[currentQuestion].correct_answer && (
                                            <Check className="text-green-500" />
                                        )}
                                        {showFeedback && answer === selectedAnswer && answer !== questions[currentQuestion].correct_answer && (
                                            <X className="text-red-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-8">
                        <Timer className="animate-spin mr-2" />
                        <p>Loading more questions...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingQuiz;