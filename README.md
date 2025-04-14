# TestQuiz - Interactive Quiz Application

TestQuiz is an interactive quiz application that allows users to create, take, and share quizzes. It provides immediate feedback on answers and a comprehensive results summary at the end of each quiz.

## Features

- Create and customize quizzes
- Take quizzes with immediate feedback
- See correct/incorrect answers highlighted in green/red
- View detailed results summary at the end of each quiz
- Share quizzes with others

## Deployment on Netlify

This application is configured for easy deployment on Netlify, which offers a generous free tier:

1. **Fork the Repository**
   - Fork this repository to your GitHub account

2. **Deploy to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub account and select the forked repository
   - Configure the build settings:
     - Build command: `npm run build`
     - Publish directory: `dist/public`
     - Functions directory: `netlify/functions`
   - Click "Deploy site"

3. **Access Your Application**
   - Once deployed, Netlify will provide a URL (e.g., `random-name.netlify.app`)
   - Your application is now publicly accessible!

4. **Custom Domain (Optional)**
   - In your Netlify dashboard, go to "Domain settings"
   - Click "Add custom domain" and follow the instructions

## Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Technologies Used

- React
- TypeScript
- Node.js
- Express
- Tailwind CSS

## License

MIT
