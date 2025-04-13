import React from 'react';
import { QuizStep } from '@/types/quiz';

interface StepIndicatorProps {
  currentStep: QuizStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps: { id: QuizStep; label: string; icon: JSX.Element }[] = [
    {
      id: 'upload',
      label: 'Upload',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      id: 'edit',
      label: 'Edit & Review',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'export',
      label: 'Export & Share',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      )
    },
    {
      id: 'quiz',
      label: 'Take Quiz',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`flex flex-col items-center ${
              currentStep === step.id ? 'text-primary-600' : 'text-neutral-500'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                currentStep === step.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-neutral-300'
              }`}
            >
              {step.icon}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>

          {index < steps.length - 1 && (
            <div className="flex-grow mx-2 h-0.5 bg-neutral-200"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
