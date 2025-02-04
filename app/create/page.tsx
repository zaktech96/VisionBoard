'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateBoard() {
  const router = useRouter();
  const [boardName, setBoardName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: 'Name Your Board' },
    { number: 2, title: 'Choose Template' },
    { number: 3, title: 'Choose Layout' },
    { number: 4, title: 'Add Content' },
  ];

  const placeholders = [
    "Career Growth 2024",
    "Personal Development",
    "Dream Lifestyle",
    "Travel Adventures",
    "Fitness Journey",
    "Business Goals",
  ];

  // Get a random placeholder from the list
  const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];

  const handleNext = () => {
    if (boardName.trim()) {
      router.push(`/create/template?name=${encodeURIComponent(boardName)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Progress Bar - Make scrollable on mobile */}
      <div className="w-full bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 md:py-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] md:min-w-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                {index > 0 && (
                  <div 
                    className={`h-[2px] w-[100px] mx-4 ${
                      currentStep > index ? 'bg-[#FF1B7C]' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium
                    ${currentStep >= step.number 
                      ? 'bg-[#FF1B7C] text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= step.number 
                      ? 'text-[#15192C] dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Better mobile spacing */}
      <div className="max-w-[600px] mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-[#15192C] dark:text-white mb-2 md:mb-3">
            Name Your Vision Board
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Give your vision board a meaningful name that inspires you
          </p>
        </div>

        <div className="space-y-6">
          <Input
            type="text"
            placeholder={randomPlaceholder}
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="w-full text-base md:text-lg py-4 md:py-6 px-4 md:px-6 rounded-xl 
                     border-2 border-gray-200/80 dark:border-gray-800"
          />
          <Button
            onClick={handleNext}
            disabled={!boardName.trim()}
            className="w-full py-4 md:py-6 rounded-xl text-base md:text-lg font-medium
                     bg-[#FF1B7C] hover:bg-[#FF1B7C]/90 text-white
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300
                     shadow-[0_8px_30px_rgb(230,21,111,0.2)]"
          >
            Continue to Template →
          </Button>
        </div>
      </div>
    </div>
  );
} 