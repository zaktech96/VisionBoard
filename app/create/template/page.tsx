'use client';

import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function TemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardName = searchParams.get('name');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(2);

  const steps = [
    { number: 1, title: 'Name Your Board' },
    { number: 2, title: 'Choose Template' },
    { number: 3, title: 'Choose Layout' },
    { number: 4, title: 'Add Content' },
  ];

  const templates = [
    {
      id: 'career',
      name: 'Career Growth',
      description: 'Plan your professional journey and career milestones',
      preview: (
        <div className="grid grid-cols-2 gap-3 w-full aspect-square">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center text-3xl">
            💼
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-xl flex items-center justify-center text-3xl">
            📈
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 rounded-xl flex items-center justify-center text-3xl">
            🎯
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900 dark:to-yellow-800 rounded-xl flex items-center justify-center text-3xl">
            🌟
          </div>
        </div>
      )
    },
    {
      id: 'lifestyle',
      name: 'Dream Lifestyle',
      description: 'Visualize your ideal life and personal goals',
      preview: (
        <div className="grid grid-cols-3 gap-3 w-full aspect-square">
          <div className="col-span-2 row-span-2 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900 dark:to-pink-800 rounded-xl flex items-center justify-center text-5xl">
            🏖️
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-800 rounded-xl flex items-center justify-center text-3xl">
            🏡
          </div>
          <div className="bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900 dark:to-teal-800 rounded-xl flex items-center justify-center text-3xl">
            ✈️
          </div>
        </div>
      )
    },
    {
      id: 'fitness',
      name: 'Fitness Journey',
      description: 'Track your health and wellness aspirations',
      preview: (
        <div className="grid grid-cols-3 gap-3 w-full aspect-square">
          <div className="bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900 dark:to-red-800 rounded-xl flex items-center justify-center text-3xl">
            💪
          </div>
          <div className="row-span-2 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-xl flex items-center justify-center text-3xl">
            🥗
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center text-3xl">
            🧘‍♀️
          </div>
          <div className="col-span-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 rounded-xl flex items-center justify-center text-3xl">
            🏃‍♂️
          </div>
        </div>
      )
    },
    {
      id: 'blank',
      name: 'Start Fresh',
      description: 'Begin with a clean slate and create your own vision',
      preview: (
        <div className="aspect-square w-full rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl">✨</div>
        </div>
      )
    }
  ];

  // Add navigation handler
  const handleContinue = () => {
    if (selectedTemplate) {
      router.push(`/create/layout?name=${encodeURIComponent(boardName || '')}&template=${selectedTemplate}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Progress Bar */}
      <div className="w-full bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#15192C] dark:text-white mb-3">
            Choose a Starting Point
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a template for "{boardName}" or start from scratch
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`group p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 text-center
                ${selectedTemplate === template.id 
                  ? 'border-[#E6156F] bg-[#FFE7F1]/20' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-[#E6156F]/40 hover:bg-[#FFE7F1]/10'}`}
            >
              <div className="mb-6 aspect-square w-full overflow-hidden rounded-xl
                           group-hover:border-[#FF1B7C]/20">
                {template.preview}
              </div>
              <h3 className={`text-xl font-semibold mb-3 transition-colors
                ${selectedTemplate === template.id 
                  ? 'text-[#E6156F]' 
                  : 'text-[#15192C] dark:text-white group-hover:text-[#E6156F]'}`}>
                {template.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mx-auto max-w-[90%]">
                {template.description}
              </p>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate}
            className="w-full max-w-[400px] mx-auto
                     bg-[#E6156F]
                     text-white text-xl font-medium
                     py-4 rounded-2xl
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300
                     shadow-[0_8px_30px_rgb(230,21,111,0.2)]
                     hover:shadow-[0_8px_30px_rgb(230,21,111,0.4)]
                     hover:bg-[#D11463]
                     active:scale-[0.99]"
          >
            <div className="flex items-center justify-center gap-3">
              <span>Continue to Layout</span>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                className="transition-transform group-hover:translate-x-1"
              >
                <path 
                  d="M4.166 10h11.667M11.666 5l4.167 5-4.167 5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ChooseTemplate() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplateContent />
    </Suspense>
  );
} 