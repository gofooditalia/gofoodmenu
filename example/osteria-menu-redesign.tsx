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
				description:
					'Patatine Fritte, Arancinette con Carne e Burro, Crostino, Panelline, Crocchè*',
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
			<div className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950">
				<div className="mx-auto max-w-4xl px-4 py-4">
					<div className="mb-4 flex items-center gap-4">
						{/* Restaurant Icon */}
						<div className="flex-shrink-0 rounded-lg bg-orange-500 p-2.5">
							<UtensilsCrossed className="h-6 w-6 text-white" />
						</div>

						{/* Category Pills in Header */}
						<div className="scrollbar-hide flex flex-1 gap-3 overflow-x-auto">
							{categories.map((category) => (
								<button
									key={category}
									ref={(el) => (categoryRefs.current[category] = el)}
									onClick={() => setActiveCategory(category)}
									className={`rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-all ${
										activeCategory === category
											? 'bg-orange-500 text-white'
											: 'hover:bg-zinc-750 bg-zinc-800 text-zinc-300'
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
							className={`px-1 pb-3 font-medium transition-colors ${
								activeTab === 'carta' ? 'border-b-2 border-orange-500 text-white' : 'text-zinc-500'
							}`}
						>
							MENU ALLA CARTA
						</button>
						<button
							onClick={() => setActiveTab('eventi')}
							className={`px-1 pb-3 font-medium transition-colors ${
								activeTab === 'eventi' ? 'border-b-2 border-orange-500 text-white' : 'text-zinc-500'
							}`}
						>
							EVENTI SPECIALI
						</button>
					</div>
				</div>

				{/* Sticky Category Indicator - Shows when scrolled */}
				{isScrolled && (
					<div className="animate-fadeIn border-t border-zinc-800 bg-zinc-900 py-3">
						<div className="mx-auto max-w-4xl px-4">
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
			<div className="mx-auto max-w-4xl px-4 py-6">
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
							className="bg-zinc-850 rounded-xl border border-zinc-800 p-6 transition-all hover:border-zinc-700 hover:shadow-lg"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="mb-2 flex items-center gap-3">
										<h3 className="text-lg font-semibold text-white">{item.name}</h3>
									</div>
									{item.description && (
										<p className="mb-3 text-sm leading-relaxed text-zinc-400">{item.description}</p>
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
															<div className="cursor-help rounded-full bg-green-500/20 p-1.5">
																<Leaf className="h-4 w-4 text-green-500" />
															</div>
															{hoveredTag === `${item.id}-${index}` && (
																<div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs whitespace-nowrap text-white shadow-lg">
																	Vegetariano
																	<div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 transform border-4 border-transparent border-t-zinc-950"></div>
																</div>
															)}
														</>
													)}
												</div>
											))}
										</div>
									)}
								</div>
								<div className="flex-shrink-0 text-right">
									<span className="text-2xl font-bold text-orange-500">{item.price}</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Info Footer */}
				<div className="bg-zinc-850 mt-8 rounded-xl border border-zinc-800 p-4">
					<p className="text-xs leading-relaxed text-zinc-500">
						* Gli ingredienti contrassegnati con asterisco potrebbero contenere allergeni. Per
						informazioni dettagliate sugli allergeni presenti nei nostri piatti, non esitate a
						chiedere al nostro personale.
					</p>
				</div>

				{/* Swipe Hint */}
				<div className="mt-4 text-center">
					<p className="text-xs text-zinc-600">← Scorri per navigare tra le categorie →</p>
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
