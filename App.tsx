
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CardData, GameStatus, DifficultyLevel } from './types';
import { EMOJI_LIST, DIFFICULTY_SETTINGS } from './constants';
import Card from './components/Card';
import StatBox from './components/StatBox';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardData[]>([]);
  const [moves, setMoves] = useState(0);
  const [points, setPoints] = useState(0);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [isLocked, setIsLocked] = useState(false);
  const [hasStartedTimer, setHasStartedTimer] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  const currentSettings = DIFFICULTY_SETTINGS[difficulty];
  const totalPairs = (currentSettings.size * currentSettings.size) / 2;

  const initializeGame = useCallback((level: DifficultyLevel = difficulty) => {
    const size = DIFFICULTY_SETTINGS[level].size;
    const pairCount = (size * size) / 2;
    
    // Shuffle emoji pool
    const emojiPool = [...EMOJI_LIST].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const deck = [...emojiPool, ...emojiPool];
    
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const shuffledCards: CardData[] = deck.map((emoji, index) => ({
      id: index,
      uniqueId: `card-${index}-${Math.random().toString(36).substr(2, 9)}`,
      content: emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setPoints(0);
    setTimer(0);
    setHasStartedTimer(false);
    setStatus(GameStatus.IDLE); // Wait for user to press START
    setIsLocked(false);

    if (timerRef.current) window.clearInterval(timerRef.current);
  }, [difficulty]);

  useEffect(() => {
    if (cards.length === 0) {
      initializeGame();
    }
  }, [initializeGame]);

  // Game completion check
  useEffect(() => {
    if (points === totalPairs && status === GameStatus.PLAYING) {
      setStatus(GameStatus.WON);
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  }, [points, totalPairs, status]);

  const togglePause = () => {
    if (status === GameStatus.WON) return;
    
    if (status === GameStatus.PLAYING) {
      setStatus(GameStatus.PAUSED);
      if (timerRef.current) window.clearInterval(timerRef.current);
    } else if (status === GameStatus.PAUSED || status === GameStatus.IDLE) {
      setStatus(GameStatus.PLAYING);
      if (hasStartedTimer) {
        timerRef.current = window.setInterval(() => {
          setTimer((prev) => prev + 1);
        }, 1000);
      }
    }
  };

  const handleDifficultyChange = (newLevel: DifficultyLevel) => {
    if (newLevel === difficulty) return;
    if ((moves > 0 || points > 0) && status !== GameStatus.WON) {
      if (window.confirm('目前的進度將會遺失，確定要更換難度嗎？')) {
        setDifficulty(newLevel);
        initializeGame(newLevel);
      }
    } else {
      setDifficulty(newLevel);
      initializeGame(newLevel);
    }
  };

  const startClock = () => {
    if (!hasStartedTimer) {
      setHasStartedTimer(true);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleCardClick = (clickedCard: CardData) => {
    if (isLocked || status !== GameStatus.PLAYING) return;
    
    startClock();

    const updatedCards = cards.map((c) => 
      c.uniqueId === clickedCard.uniqueId ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlippedCards = [...flippedCards, { ...clickedCard, isFlipped: true }];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      checkMatch(newFlippedCards);
    }
  };

  const checkMatch = (toCheck: CardData[]) => {
    setIsLocked(true);
    const [card1, card2] = toCheck;

    if (card1.content === card2.content) {
      setTimeout(() => {
        setCards((prevCards) =>
          prevCards.map((c) =>
            c.content === card1.content ? { ...c, isMatched: true, isFlipped: true } : c
          )
        );
        setPoints((prev) => prev + 1);
        setFlippedCards([]);
        setIsLocked(false);
      }, 600);
    } else {
      // 0.8s wait as per specification
      setTimeout(() => {
        setCards((prevCards) =>
          prevCards.map((c) =>
            toCheck.some((tc) => tc.uniqueId === c.uniqueId) 
              ? { ...c, isFlipped: false } 
              : c
          )
        );
        setFlippedCards([]);
        setIsLocked(false);
      }, 800);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round((points / totalPairs) * 100) || 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-serif-custom text-black mb-8 tracking-tight font-bold">記憶翻牌大考驗</h1>

      {/* Status Bar Section */}
      <div className="flex gap-4 mb-6">
        <StatBox label="Moves" value={moves} />
        <StatBox label="Times" value={formatTime(timer)} />
        <StatBox label="Points" value={`${points}/${totalPairs}`} />
      </div>

      {/* Progress Bar Section (2.2 Status Bar) */}
      <div className="w-full max-w-md bg-white border border-black h-4 mb-8 relative rounded-full overflow-hidden shadow-sm">
        <div 
          className="h-full bg-black transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-500 mix-blend-difference">
          {progressPercent}%
        </span>
      </div>

      {/* Game Board Section (2.3 Game Board) */}
      <div className="relative w-full max-w-md mb-10">
        <div 
          className="grid gap-3"
          style={{ 
            gridTemplateColumns: `repeat(${currentSettings.size}, minmax(0, 1fr))`,
            filter: status === GameStatus.PAUSED ? 'blur(10px)' : 'none'
          }}
        >
          {cards.map((card) => (
            <Card 
              key={card.uniqueId} 
              card={card} 
              onClick={handleCardClick} 
              disabled={isLocked || card.isFlipped || card.isMatched || status === GameStatus.PAUSED}
            />
          ))}
        </div>

        {/* Pause Overlay (Section 2.3 & 4) */}
        {status === GameStatus.PAUSED && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl z-10">
            <div className="bg-white px-6 py-4 border-2 border-black font-bold tracking-widest uppercase">
              Paused
            </div>
          </div>
        )}
      </div>

      {/* Control Panel Section (2.1 & 2.3) */}
      <div className="flex flex-col gap-4 items-center w-full">
        <div className="flex gap-3">
          <button 
            onClick={togglePause}
            className={`px-12 py-3 border border-black rounded-full font-bold tracking-widest text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
              status === GameStatus.PLAYING ? 'bg-orange-100' : 'bg-[#cccccc]'
            }`}
          >
            {status === GameStatus.PLAYING ? '暫停 PAUSE' : '開始 START'}
          </button>
          
          <button 
            onClick={() => initializeGame()}
            className="px-6 py-3 bg-[#cccccc] border border-black rounded-full font-bold text-xs tracking-widest uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
          >
            Restart
          </button>
        </div>

        {/* Difficulty Selectors */}
        <div className="flex gap-2">
          {(Object.keys(DIFFICULTY_SETTINGS) as DifficultyLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level)}
              className={`px-6 py-2 text-xs font-bold border border-black transition-all ${
                difficulty === level 
                ? 'bg-black text-white' 
                : 'bg-[#cccccc] text-black hover:bg-gray-300'
              }`}
            >
              {level === 'EASY' ? '2*2' : level === 'MEDIUM' ? '4*4' : '6*6'}
            </button>
          ))}
        </div>
      </div>

      {/* Result Modal (2.4 Result Modal) */}
      {status === GameStatus.WON && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border-2 border-black p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-4xl font-serif-custom mb-6 font-bold uppercase">Game Clear!</h2>
            <div className="space-y-4 mb-8 text-left">
              <div className="flex justify-between border-b-2 border-black/10 pb-2">
                <span className="text-gray-500 uppercase font-bold text-xs tracking-widest">Time</span>
                <span className="font-bold text-xl">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between border-b-2 border-black/10 pb-2">
                <span className="text-gray-500 uppercase font-bold text-xs tracking-widest">Total Moves</span>
                <span className="font-bold text-xl">{moves}</span>
              </div>
              <div className="flex justify-between border-b-2 border-black/10 pb-2">
                <span className="text-gray-500 uppercase font-bold text-xs tracking-widest">Rank</span>
                <span className="font-bold text-xl text-green-600">S Rank</span>
              </div>
            </div>
            <button 
              onClick={() => initializeGame()}
              className="w-full py-4 bg-[#cccccc] border-2 border-black font-bold tracking-widest uppercase hover:bg-gray-400 active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              再玩一次 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
