
import React, { useMemo } from 'react';
import { useTranslations } from '../../hooks/useTranslations';

interface ThankYouModalProps {
    onClose: () => void;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ onClose }) => {
    const t = useTranslations();
    const confettiColors = ['bg-indigo-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-400', 'bg-blue-500', 'bg-pink-500'];
    const confettiPieces = useMemo(
        () => Array.from({ length: 42 }).map((_, index) => ({
            id: index,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 0.6}s`,
            duration: `${2.2 + Math.random() * 1.6}s`,
            rotate: `${Math.random() * 360}deg`,
            colorClass: confettiColors[index % confettiColors.length],
        })),
        []
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
            <style>{`
                @keyframes confetti-fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                {confettiPieces.map((piece) => (
                    <span
                        key={piece.id}
                        className={`absolute top-0 h-2 w-2 rounded-sm ${piece.colorClass}`}
                        style={{
                            left: piece.left,
                            animation: `confetti-fall ${piece.duration} linear ${piece.delay} forwards`,
                            transform: `rotate(${piece.rotate})`,
                        }}
                    />
                ))}
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center animate-scale-in relative z-10">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold my-4 text-gray-900 dark:text-white">{t.thankYouOrder}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{t.orderPlacedSuccess}</p>
                <button onClick={onClose} className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                    {t.close}
                </button>
            </div>
        </div>
    );
};

export default ThankYouModal;