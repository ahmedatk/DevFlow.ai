import React, { useState } from 'react';

const faqData = [
    {
        question: "What is DevFlow.AI?",
        answer: "DevFlow.AI is an all-in-one AI-powered development assistant that helps developers plan, build, debug, document, and deploy projects without leaving the IDE. It acts like a personal co-pilot for full project lifecycle management."
    },
    {
        question: "Is DevFlow.AI free to use?",
        answer: "Yes, DevFlow.AI offers a free tier that gives you access to essential features. We also have premium plans for power users and teams who need advanced capabilities and higher usage limits."
    },
    {
        question: "Can I use DevFlow.AI with my existing projects?",
        answer: "Absolutely! DevFlow.AI is designed to integrate seamlessly with your existing workflows. You can import your projects and start using our AI tools immediately."
    },
    {
        question: "What programming languages does DevFlow.AI support?",
        answer: "DevFlow.AI supports a wide range of popular programming languages including JavaScript, TypeScript, Python, Java, C++, and many more. We are constantly adding support for new languages."
    },
    {
        question: "How does the AI code generation work?",
        answer: "Our AI models are trained on vast amounts of code and documentation. When you describe a feature or task, the AI analyzes your request and generates high-quality, syntactically correct code that you can review and integrate into your project."
    }
];

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-gray-700 last:border-0">
            <button
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
                onClick={onClick}
            >
                <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? 'text-blue-400' : 'text-gray-200 group-hover:text-blue-400'}`}>
                    {question}
                </span>
                <span className={`ml-6 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className={`w-6 h-6 ${isOpen ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-gray-400 leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
};

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 relative z-10" id="faq">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Everything you need to know about DevFlow.AI
                    </p>
                </div>

                <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-xl">
                    {faqData.map((item, index) => (
                        <FAQItem
                            key={index}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
