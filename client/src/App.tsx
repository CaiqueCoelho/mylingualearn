import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NewsFeed from "./pages/NewsFeed";
import ArticleView from "./pages/ArticleView";
import Vocabulary from "./pages/Vocabulary";
import Progress from "./pages/Progress";
import Games from "./pages/Games";
import ChromeAITest from "./pages/ChromeAITest";
import './i18n/config';
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/news"} component={NewsFeed} />
      <Route path={"/article/:id"} component={ArticleView} />
      <Route path={"/vocabulary"} component={Vocabulary} />
      <Route path={"/progress"} component={Progress} />
      <Route path={"/games"} component={Games} />
      <Route path={"/chrome-ai-test"} component={ChromeAITest} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <FirebaseAuthProvider>
          <TooltipProvider>
            <Toaster />
            <SiteHeader />
            <Router />
            <SiteFooter />
          </TooltipProvider>
        </FirebaseAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

