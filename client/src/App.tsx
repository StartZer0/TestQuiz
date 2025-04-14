import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Home from "@/pages/home";
import MyQuizzes from "@/pages/my-quizzes";
import QuizDetail from "@/pages/quiz-detail";
import TakeQuiz from "@/pages/take-quiz";
import Help from "@/pages/help";
import TestOption from "@/pages/test-option";
import CombineQuizzes from "@/pages/combine-quizzes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-quizzes" component={MyQuizzes} />
      <Route path="/quiz/:shareId">
        {(params) => <TakeQuiz params={params} />}
      </Route>
      <Route path="/quiz/:shareId/details">
        {(params) => <QuizDetail params={params} />}
      </Route>
      <Route path="/help" component={Help} />
      <Route path="/test-options" component={TestOption} />
      <Route path="/combine-quizzes" component={CombineQuizzes} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <Router />
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
