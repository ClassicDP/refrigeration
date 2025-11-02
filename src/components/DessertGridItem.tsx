import React from 'react';
import type { Dessert } from '../types/dessert';

interface DessertGridItemProps {
  dessert: Dessert;
  isSelected: boolean;
  onSelect: (dessert: Dessert) => void;
  // When provided, parent sizes the grid cell. Component stretches to fill.
  style?: React.CSSProperties;
}

export const DessertGridItem: React.FC<DessertGridItemProps> = ({ dessert, isSelected, onSelect, style }) => {
  return (
    <div
      className={`relative w-full h-full rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-target overflow-hidden ${
        isSelected ? 'border-green-500 bg-green-50' : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
      onClick={() => onSelect(dessert)}
      style={{ 
        minHeight: '80px',
        minWidth: '80px',
        ...style,
        ...(isSelected && {
          backgroundColor: 'rgb(224, 252, 232)', // Очень светло-салатовый фон
        })
      }}
    >
      {/* Цена в левом верхнем углу */}
      <div className="absolute z-30 top-1 left-1 bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold shadow-sm border border-gray-100/50">
        {dessert.price}₽
      </div>

      {/* Изображение десерта */}
      <div className="relative w-full h-full">
        <img
          src={dessert.image}
          alt={dessert.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = '/desserts/dessert_1_1.png';
          }}
        />
      </div>

      {/* Бейдж скидки в правом верхнем углу */}
      {dessert.isOnSale && dessert.discount && (
        <div className="absolute z-30 top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-semibold shadow-md">
          -{dessert.discount}%
        </div>
      )}
    </div>
  );
};
