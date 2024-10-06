import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import './BubblePopperGame.css';
const BubblePopperGame = () => {
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  const createBubble = useCallback(() => {
    const newBubble = {
      id: Math.random(),
      x: Math.random() * 90 + 5, // Keep bubbles within 5-95% of container width
      y: Math.random() * 60 + 20, // Keep bubbles within 20-80% of container height
      size: Math.random() * 30 + 20, // Random size between 20-50px
      color: `hsl(${Math.random() * 360}, 80%, 75%)`, // Random pastel color
    };
    setBubbles(prev => [...prev, newBubble]);
  }, []);

  const popBubble = (id) => {
    setBubbles(prev => prev.filter(bubble => bubble.id !== id));
    setScore(prev => prev + 1);
  };

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(createBubble, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, createBubble]);

  return (
    <div className="w-full max-w-2xl mx-auto my-4 text-center">
      <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">While you wait...</h3>
          <p className="text-gray-600">Pop some bubbles to pass the time!</p>
          {!gameStarted && (
            <button
              onClick={() => setGameStarted(true)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Start Game
            </button>
          )}
        </div>
        
        {gameStarted && (
          <>
            <div className="flex justify-between items-center mb-2 px-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-500" />
                <span className="font-bold">Score: {score}</span>
              </div>
            </div>
            
            <div className="relative w-full h-[300px] bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden">
              {bubbles.map(bubble => (
                <button
                  key={bubble.id}
                  onClick={() => popBubble(bubble.id)}
                  className="absolute rounded-full transition-transform hover:scale-110 cursor-pointer animate-float"
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    backgroundColor: bubble.color,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BubblePopperGame;