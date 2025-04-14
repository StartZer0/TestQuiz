# Quiz Combiner Utility

This utility helps you combine multiple quiz JSON files into a single comprehensive quiz file.

## Instructions

1. **Place your quiz JSON files in the `quiz-files` directory**
   - Each file should have the standard quiz format with a `questions` array
   - The script will automatically find all `.json` files in this directory

2. **Run the script**
   ```bash
   node scripts/combine-quizzes.js
   ```

3. **Get your combined quiz**
   - The combined quiz will be saved as `combined-quiz.json` in the root directory
   - The script will report how many questions were added from each file and the total

## Customizing the Output

You can edit the script to customize:
- The input directory (where your quiz files are located)
- The output file name and location
- The title of the combined quiz

## Example Quiz Format

Each quiz file should have this structure:

```json
{
  "title": "Quiz Title",
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "type": "multiple-choice",
      "options": [
        { "id": "a1", "text": "Option 1", "isCorrect": false },
        { "id": "a2", "text": "Option 2", "isCorrect": true },
        { "id": "a3", "text": "Option 3", "isCorrect": false },
        { "id": "a4", "text": "Option 4", "isCorrect": false }
      ],
      "required": true,
      "points": 1
    },
    // More questions...
  ]
}
```

## Troubleshooting

- If a file doesn't have the expected structure, the script will skip it and continue with the next file
- Check the console output for any warnings or errors
