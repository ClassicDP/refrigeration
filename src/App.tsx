import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { DessertGridItem } from './components/DessertGridItem';
import type { Dessert, SelectedDessert } from './types/dessert';
import dessertsData from './data/desserts.json';
import './App.css'

function App() {
  const [selectedDesserts, setSelectedDesserts] = useState<SelectedDessert[]>([]);
  
  const desserts: Dessert[] = dessertsData;
  
  const totalPrice = selectedDesserts.reduce((sum, dessert) => sum + dessert.price * dessert.quantity, 0);
  
  const handleSelectDessert = useCallback((dessert: Dessert) => {
    setSelectedDesserts(prev => {
      const existingIndex = prev.findIndex(item => item.id === dessert.id);
      
      if (existingIndex >= 0) {
        // Если десерт уже выбран, удаляем его
        return prev.filter(item => item.id !== dessert.id);
      } else {
        // Если десерт не выбран, добавляем его с количеством 1
        return [...prev, { ...dessert, quantity: 1 }];
      }
    });
  }, []);

  const handleRemoveDessert = useCallback((id: number) => {
    setSelectedDesserts(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const handleClearCart = useCallback(() => {
    setSelectedDesserts([]);
  }, []);
  
  const isSelected = (dessertId: number) => {
    return selectedDesserts.some(item => item.id === dessertId);
  };

  // Exact grid sizing so the last row is never cut
  const cols = 8;
  const rows = 5;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const gridHostRef = useRef<HTMLDivElement | null>(null);
  const mainColRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const [cellSize, setCellSize] = useState<number | null>(null);
  const [hostHeight, setHostHeight] = useState<number | null>(null);
  const [cartWidth, setCartWidth] = useState<number>(180);

  useEffect(() => {
    const el = gridHostRef.current;
    const col = mainColRef.current;
    const left = leftRef.current;
    const root = rootRef.current;
    if (!el || !col || !left || !root) return;

    const GAP_PX = 2; // Tailwind gap-0.5 => 2px при базовом 16px
    const compute = () => {
      const w = el.clientWidth; // без дробей и без скроллбаров
      // высота доступной области: высота колонки минус заголовок и подсказка
      const headerH = headerRef.current ? headerRef.current.offsetHeight : 0;
      const colH = col.clientHeight;
      const h = Math.max(0, colH - headerH);
      setHostHeight(h);
      const maxCellByWidth = Math.floor((w - GAP_PX * (cols - 1)) / cols);
      const maxCellByHeight = Math.floor((h - GAP_PX * (rows - 1)) / rows);
      let size = Math.max(0, Math.min(maxCellByWidth, maxCellByHeight));
      // Защитный цикл от погрешностей округления и DPR
      while (
        size > 0 && (
          cols * size + GAP_PX * (cols - 1) > w ||
          rows * size + GAP_PX * (rows - 1) > h
        )
      ) {
        size -= 1;
      }
      setCellSize(size);

      // Ширина корзины = вся ширина минус точная ширина сетки и отступы слева
      const gridExactWidth = cols * size + GAP_PX * (cols - 1);
      const cs = window.getComputedStyle(left);
      const padLeft = parseFloat(cs.paddingLeft || '0');
      const padRight = parseFloat(cs.paddingRight || '0');
      const paddings = Math.round(padLeft + padRight);
      const total = root.clientWidth;
      const desiredCart = Math.max(180, total - paddings - gridExactWidth);
      setCartWidth(Math.max(180, Math.floor(desiredCart)));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(col);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  const gridStyle = useMemo(() => {
    if (!cellSize) return undefined;
    return {
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      // Keep visual gap in sync with sizing math
      gap: '2px',
      justifyContent: 'center' as const,
      alignContent: 'center' as const,
    };
  }, [cellSize]);

  return (
    <div ref={rootRef} className="bg-gradient-to-br from-blue-50 to-blue-100 flex overflow-hidden" style={{ height: '100dvh' }}>
      {/* Основная область с сеткой десертов */}
      <div ref={leftRef} className="flex-1 p-2 overflow-hidden">
        <div className="h-full flex flex-col">
          <h1 ref={headerRef} className="text-lg font-bold text-gray-800 mb-1 text-center flex-shrink-0">
            Выберите десерты
          </h1>
          
          {/* Сетка 8x5 оптимизированная для вертикального экрана */}
          <div ref={mainColRef} className="flex-1 flex items-center justify-end min-h-0">
            {/* Host defines available space for the grid; ResizeObserver keeps sizing exact */}
            <div ref={gridHostRef} className="w-full" style={hostHeight != null && cellSize != null ? { height: hostHeight, maxWidth: 'none', width: cols * cellSize + (cols - 1) * 2 } : hostHeight != null ? { height: hostHeight } : undefined}>
              <div className="grid w-full h-full grid-cols-8 grid-rows-5 gap-0.5" style={gridStyle}>
              {Array.from({ length: rows }, (_, row) => 
                Array.from({ length: cols }, (_, col) => {
                  const dessert = desserts.find(d => d.position.row === row && d.position.col === col);
                  return dessert ? (
                    <DessertGridItem
                      key={dessert.id}
                      dessert={dessert}
                      isSelected={isSelected(dessert.id)}
                      onSelect={handleSelectDessert}
                      style={cellSize ? { width: cellSize, height: cellSize } : undefined}
                    />
                  ) : (
                    <div key={`empty-${row}-${col}`} style={cellSize ? { width: cellSize, height: cellSize } : undefined} />
                  );
                })
              ).flat()}
              </div>
            </div>
          </div>
          
          {/* Нижняя подсказка убрана по требованию */}
        </div>
      </div>
      
      {/* Панель корзины — фиксированная ширина */}
      <div className="flex-shrink-0 bg-white border-l border-gray-200 shadow-xl flex flex-col" style={{ height: '100dvh', width: `${cartWidth}px` }}>
        {/* Шапка корзины — фиксированная */}
        <div className="flex-shrink-0 bg-white z-10 p-1 border-b border-gray-100 min-h-[36px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-sm font-bold text-gray-800">Заказ</h2>
            {selectedDesserts.length > 0 && (
              <button
                onClick={handleClearCart}
                className="px-1 py-0.5 text-[9px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
              >
                Очистить
              </button>
            )}
          </div>
        </div>
        
        {/* Контент корзины — скроллируемый */}
        <div className="flex-1 overflow-y-auto p-1 pb-2" style={{ maxHeight: 'calc(100vh - 86px)' }}>
          {selectedDesserts.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-5xl mb-3">🍰</div>
              <p className="text-lg font-semibold mb-2">Корзина пуста</p>
              <p className="text-sm px-4">Выберите десерты из меню, чтобы добавить их в заказ.</p>
            </div>
          ) : (
            <div className="space-y-1.5 pb-1">
              {selectedDesserts.map((dessert) => (
                <div key={dessert.id} className="relative flex flex-col gap-1 p-2 bg-white rounded border border-gray-100 w-full mb-1.5">
                  {/* Кнопка удаления — в правом верхнем углу поверх изображения */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDessert(dessert.id);
                    }}
                    className="absolute top-1 right-1 z-10 w-4 h-4 flex items-center justify-center text-[10px] leading-none text-gray-400 hover:text-red-500 transition-colors"
                    style={{ textShadow: '0 0 2px white, 0 0 4px white' }}
                    title="Удалить"
                  >
                    ×
                  </button>
                  
                  {/* Верх: изображение по центру */}
                  <div className="w-full h-20 flex items-center justify-center bg-gray-50 border border-gray-100 rounded overflow-hidden">
                    <img
                      src={dessert.image}
                      alt={dessert.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/desserts/dessert_1_1.png';
                      }}
                    />
                  </div>
                  
                  {/* Под изображением: описание */}
                  <div className="text-[9px] text-gray-600 leading-tight line-clamp-2 min-h-[20px]">{dessert.description}</div>
                  
                  {/* Нижняя строка: название и цена */}
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-[10px] font-medium text-gray-800 truncate flex-1">{dessert.name}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="text-[11px] font-bold text-green-600">{dessert.price * dessert.quantity}₽</div>
                      {dessert.isOnSale && dessert.discount && (
                        <span className="text-[8px] text-red-500">-{dessert.discount}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Итого и кнопка "Заказать" — зафиксированы внизу */}
        {selectedDesserts.length > 0 && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-1 shadow-lg">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px] text-gray-500 whitespace-nowrap">
                {selectedDesserts.length} шт
              </span>
              <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{totalPrice}₽</span>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-1.5 rounded text-[10px] transition-colors min-h-[32px] flex items-center justify-center">
              Заказать
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
