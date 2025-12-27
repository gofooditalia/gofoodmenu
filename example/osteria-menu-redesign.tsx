import React, { useState, useRef, useEffect } from 'react';
import { UtensilsCrossed, Leaf } from 'lucide-react';

const MenuRedesign = () => {
  const [activeTab, setActiveTab] = useState('carta');
  const [activeCategory, setActiveCategory] = useState('antipasti');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredTag, setHoveredTag] = useState(null);
  const contentRef = useRef(null);
  const categoryRefs = useRef({});

  const categories = ['antipasti', 'primi', 'secondi', 'contorni', 'dolci'];
  
  const categoryLabels = {
    antipasti: 'GLI ANTIPASTI',
    primi: 'I NOSTRI DELIZIOSI PRIMI',
    secondi: 'I SECONDI',
    contorni: 'I CONTORNI',
    dolci: 'I DOLCI'
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll the active category button into view
    const activeButton = categoryRefs.current[activeCategory];
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeCategory]);

  const menuItems = {
    antipasti: [
      {
        id: 1,
        name: 'Patatine fresche fritte',
        price: '4.00',
        description: '',
        tags: ['vegetariano'],
        color: '#10b981'
      },
      {
        id: 2,
        name: 'Bruschetta classica',
        price: '5.00',
        description: 'Pomodoro, Olio, Sale, Pepe, Origano',
        tags: ['vegetariano'],
        color: '#10b981'
      },
      {
        id: 3,
        name: 'Antipasto caldo',
        price: '6.00',
        description: 'Patatine Fritte, Arancinette con Carne e Burro, Crostino, Panelline, Crocchè*',
        tags: [],
        color: '#f59e0b'
      },
      {
        id: 4,
        name: 'Antipasto delle fritte',
        price: '7.00',
        description: 'Verdure Pastellate, Crostino, Tuma, Panelle*, Crocchè*',
        tags: ['vegetariano'],
        color: '#10b981'
      }
    ],
    primi: [
      {
        id: 5,
        name: 'Carbonara',
        price: '12.00',
        description: 'Guanciale, Uova, Pecorino Romano, Pepe Nero',
        tags: [],
        color: '#f59e0b'
      },
      {
        id: 6,
        name: 'Cacio e Pepe',
        price: '10.00',
        description: 'Pecorino Romano, Pepe Nero',
        tags: ['vegetariano'],
        color: '#10b981'
      }
    ],
    secondi: [
      {
        id: 7,
        name: 'Saltimbocca alla Romana',
        price: '16.00',
        description: 'Vitello, Prosciutto, Salvia, Vino Bianco',
        tags: [],
        color: '#f59e0b'
      }
    ],
    contorni: [
      {
        id: 8,
        name: 'Insalata mista',
        price: '5.00',
        description: 'Lattuga, Pomodori, Olive, Carote',
        tags: ['vegetariano'],
        color: '#10b981'
      }
    ],
    dolci: [
      {
        id: 9,
        name: 'Tiramisù',
        price: '6.00',
        description: 'Savoiardi, Mascarpone, Caffè, Cacao',
        tags: ['vegetariano'],
        color: '#10b981'
      }
    ]
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    const currentIndex = categories.indexOf(activeCategory);
    
    if (isLeftSwipe && currentIndex < categories.length - 1) {
      setActiveCategory(categories[currentIndex + 1]);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      setActiveCategory(categories[currentIndex - 1]);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const navigateCategory = (direction) => {
    const currentIndex = categories.indexOf(activeCategory);
    if (direction === 'prev' && currentIndex > 0) {
      setActiveCategory(categories[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < categories.length - 1) {
      setActiveCategory(categories[currentIndex + 1]);
    }
  };

  const currentIndex = categories.indexOf(activeCategory);

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            {/* Restaurant Icon */}
            <div className="flex-shrink-0 bg-orange-500 p-2.5 rounded-lg">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>

            {/* Category Pills in Header */}
            <div className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  ref={(el) => (categoryRefs.current[category] = el)}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all text-sm ${
                    activeCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-zinc-800">
            <button
              onClick={() => setActiveTab('carta')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'carta'
                  ? 'text-white border-b-2 border-orange-500'
                  : 'text-zinc-500'
              }`}
            >
              MENU ALLA CARTA
            </button>
            <button
              onClick={() => setActiveTab('eventi')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'eventi'
                  ? 'text-white border-b-2 border-orange-500'
                  : 'text-zinc-500'
              }`}
            >
              EVENTI SPECIALI
            </button>
          </div>
        </div>

        {/* Sticky Category Indicator - Shows when scrolled */}
        {isScrolled && (
          <div className="bg-zinc-900 border-t border-zinc-800 py-3 animate-fadeIn">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-orange-500">
                  {categoryLabels[activeCategory]}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Navigation */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Menu Items with Swipe */}
        <div
          ref={contentRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="space-y-4"
        >
          {menuItems[activeCategory]?.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-850 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {item.name}
                    </h3>
                  </div>
                  {item.description && (
                    <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                      {item.description}
                    </p>
                  )}
                  {/* Icon Tags with Tooltip - Below description */}
                  {item.tags.length > 0 && (
                    <div className="flex gap-2">
                      {item.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="relative"
                          onMouseEnter={() => setHoveredTag(`${item.id}-${index}`)}
                          onMouseLeave={() => setHoveredTag(null)}
                        >
                          {tag === 'vegetariano' && (
                            <>
                              <div className="p-1.5 bg-green-500/20 rounded-full cursor-help">
                                <Leaf className="w-4 h-4 text-green-500" />
                              </div>
                              {hoveredTag === `${item.id}-${index}` && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-950 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg border border-zinc-700">
                                  Vegetariano
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-950"></div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-bold text-orange-500">
                    {item.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-zinc-850 rounded-xl border border-zinc-800">
          <p className="text-xs text-zinc-500 leading-relaxed">
            * Gli ingredienti contrassegnati con asterisco potrebbero contenere allergeni. 
            Per informazioni dettagliate sugli allergeni presenti nei nostri piatti, 
            non esitate a chiedere al nostro personale.
          </p>
        </div>

        {/* Swipe Hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-600">
            ← Scorri per navigare tra le categorie →
          </p>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MenuRedesign;