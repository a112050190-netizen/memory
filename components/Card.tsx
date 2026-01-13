
import React from 'react';
import { CardData } from '../types';

interface CardProps {
  card: CardData;
  onClick: (card: CardData) => void;
  disabled: boolean;
  isHidden?: boolean; // Used for pausing
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled, isHidden }) => {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card);
    }
  };

  if (isHidden) {
    return (
      <div className="w-full aspect-square bg-gray-300 rounded-xl animate-pulse shadow-sm"></div>
    );
  }

  return (
    <div 
      className="perspective-1000 w-full aspect-square cursor-pointer"
      onClick={handleClick}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 preserve-3d rounded-xl shadow-md ${
          card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Face (Emoji) */}
        <div className="absolute inset-0 w-full h-full bg-white flex items-center justify-center backface-hidden rotate-y-180 rounded-xl border border-gray-100 shadow-inner">
          <span className={`text-4xl select-none transition-opacity ${card.isMatched ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}`}>
            {card.content}
          </span>
        </div>

        {/* Back Face (Salmon pink with ?) */}
        <div className="absolute inset-0 w-full h-full bg-[#ff9999] flex items-center justify-center backface-hidden rounded-xl border-2 border-white shadow-md">
           <span className="text-white text-3xl font-bold font-serif-custom select-none">?</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
