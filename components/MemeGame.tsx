"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MemeGame = () => {
  // Game states: 'start', 'caption', 'voting', 'results'
  const [gameState, setGameState] = useState('start');
  const [memes, setMemes] = useState([
    {
      id: 1,
      name: 'Distracted Boyfriend',
      placeholder: '/api/placeholder/400/300',
      caption: '',
      votes: 0
    },
    {
      id: 2,
      name: 'Drake Posting',
      placeholder: '/api/placeholder/400/300',
      caption: '',
      votes: 0
    },
    {
      id: 3,
      name: 'Is This a Pigeon',
      placeholder: '/api/placeholder/400/300',
      caption: '',
      votes: 0
    }
  ]);

  const StartScreen = () => (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Meme Madness: The Ultimate Meme-Off</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Ready to create some tech-themed memes?</p>
        <button 
          onClick={() => setGameState('caption')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start Game
        </button>
      </CardContent>
    </Card>
  );

  const CaptionScreen = () => (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Create Your Captions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memes.map((meme) => (
          <Card key={meme.id}>
            <CardHeader>
              <CardTitle className="text-lg">{meme.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={meme.placeholder} 
                alt={meme.name}
                className="w-full h-48 object-cover mb-4"
              />
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Enter your caption..."
                value={meme.caption}
                onChange={(e) => {
                  const updatedMemes = memes.map(m =>
                    m.id === meme.id ? { ...m, caption: e.target.value } : m
                  );
                  setMemes(updatedMemes);
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <button 
        onClick={() => setGameState('voting')}
        className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit Captions
      </button>
    </div>
  );

  const VotingScreen = () => (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Vote for the Best Memes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memes.map((meme) => (
          <Card key={meme.id}>
            <CardHeader>
              <CardTitle className="text-lg">{meme.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={meme.placeholder} 
                alt={meme.name}
                className="w-full h-48 object-cover mb-4"
              />
              <p className="mb-4">{meme.caption}</p>
              <button
                onClick={() => {
                  const updatedMemes = memes.map(m =>
                    m.id === meme.id ? { ...m, votes: m.votes + 1 } : m
                  );
                  setMemes(updatedMemes);
                }}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Vote
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
      <button 
        onClick={() => setGameState('results')}
        className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Show Results
      </button>
    </div>
  );

  const ResultsScreen = () => (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Final Results</h2>
      <div className="grid grid-cols-1 gap-4">
        {[...memes]
          .sort((a, b) => b.votes - a.votes)
          .map((meme) => (
            <Card key={meme.id}>
              <CardHeader>
                <CardTitle className="text-lg">{meme.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <img 
                    src={meme.placeholder} 
                    alt={meme.name}
                    className="w-48 h-48 object-cover mr-4"
                  />
                  <div>
                    <p className="mb-2">{meme.caption}</p>
                    <p className="font-bold">Votes: {meme.votes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>
      <button 
        onClick={() => {
          setMemes(memes.map(m => ({ ...m, caption: '', votes: 0 })));
          setGameState('start');
        }}
        className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Play Again
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {gameState === 'start' && <StartScreen />}
      {gameState === 'caption' && <CaptionScreen />}
      {gameState === 'voting' && <VotingScreen />}
      {gameState === 'results' && <ResultsScreen />}
    </div>
  );
};

export default MemeGame;