import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const TestOption: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const options = [
    "A) 1, 2",
    "B) 2, 4",
    "C) 1, 3",
    "D) 2, 3",
    "E) 3, 4"
  ];
  
  const handleOptionClick = (index: number) => {
    console.log("Option clicked:", index);
    setSelectedOption(index);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6">Test Options</h2>
          
          <div className="space-y-3 mb-6">
            {options.map((option, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === index ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-primary-200'
                }`}
                onClick={() => handleOptionClick(index)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <div 
                      className={`w-5 h-5 border rounded-full flex items-center justify-center ${
                        selectedOption === index ? 'border-primary-600 bg-primary-600' : 'border-neutral-300'
                      }`}
                    >
                      {selectedOption === index && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <circle cx="10" cy="10" r="4" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3">{option}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <p className="px-4 py-2 bg-neutral-100 rounded-lg">
              {selectedOption !== null ? `Selected: ${options[selectedOption]}` : 'No option selected'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOption;