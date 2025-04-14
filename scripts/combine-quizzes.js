const fs = require('fs');
const path = require('path');

/**
 * Combines multiple quiz JSON files into a single quiz file
 */
async function combineQuizzes() {
  // Configuration - update these paths as needed
  const inputDir = './quiz-files'; // Directory containing your quiz JSON files
  const outputFile = './combined-quiz.json'; // Output file path
  const combinedTitle = 'Combined Quiz'; // Title for the combined quiz

  try {
    // Create the input directory if it doesn't exist
    if (!fs.existsSync(inputDir)) {
      fs.mkdirSync(inputDir, { recursive: true });
      console.log(`Created directory: ${inputDir}`);
      console.log(`Please place your quiz JSON files in this directory and run the script again.`);
      return;
    }

    // Get all JSON files in the input directory
    const files = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(inputDir, file));

    if (files.length === 0) {
      console.log(`No JSON files found in ${inputDir}. Please add your quiz files and try again.`);
      return;
    }

    console.log(`Found ${files.length} JSON files to combine.`);

    // Initialize the combined quiz structure
    const combinedQuiz = {
      title: combinedTitle,
      questions: []
    };

    // Process each file
    for (const file of files) {
      console.log(`Processing: ${file}`);
      
      // Read and parse the JSON file
      const fileContent = fs.readFileSync(file, 'utf8');
      const quizData = JSON.parse(fileContent);
      
      // Validate that it has the expected structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        console.warn(`Warning: ${file} does not have a valid 'questions' array. Skipping.`);
        continue;
      }
      
      // Add the file's questions to the combined quiz
      combinedQuiz.questions = [...combinedQuiz.questions, ...quizData.questions];
      
      console.log(`Added ${quizData.questions.length} questions from ${file}`);
    }

    // Write the combined quiz to the output file
    fs.writeFileSync(outputFile, JSON.stringify(combinedQuiz, null, 2));
    
    console.log(`\nCombination complete!`);
    console.log(`Total questions: ${combinedQuiz.questions.length}`);
    console.log(`Combined quiz saved to: ${outputFile}`);
  } catch (error) {
    console.error('Error combining quizzes:', error);
  }
}

// Run the function
combineQuizzes();
