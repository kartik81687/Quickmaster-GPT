"use client";
import React, { useState, useRef, useEffect } from "react";
import { Minus, Plus } from "lucide-react";

// Define the type for the props
interface FaqItemProps {
  number: string; // If it's a string like "01", "02", etc.
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ number, question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);

  // Use a more specific type for the ref
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 transition-all duration-300 ease-in-out">
      <div
        className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 sm:gap-6 w-full">
          <div className="text-outline font-sans font-bold text-center align-middle text-3xl sm:text-5xl capitalize leading-10 text-transparent bg-clip-text">
            {number.padStart(2, "0")}
          </div>
          <div className="text-neutral-700 text-md sm:text-2xl capitalize dark:text-white flex-grow">
            {question}
          </div>
          {isOpen ? (
            <Minus className="text-[#65A30D] w-6 h-6 stroke-[3]" />
          ) : (
            <Plus className="text-neutral-500 w-6 h-6 stroke-[3]" />
          )}
        </div>
      </div>
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: `${height}px`,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          className="px-4 sm:px-8 pb-4 sm:pb-6 bg-neutral-50 dark:bg-neutral-800"
        >
          <div className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-lg pl-16 sm:pl-24">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqItem;
