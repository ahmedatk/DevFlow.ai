import React, { useState, useEffect } from 'react';

// --- Typewriter Component ---
const Typewriter = ({ text, delay = 50 }: { text: string, delay?: number }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, delay, text]);

    return (
        <span>{currentText}<span className="typewriter-cursor"></span></span>
    );
};

export default Typewriter;
