import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './Providers';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Home } from '../pages/Home';
import { Pattern } from '../pages/Pattern';
import { Problem } from '../pages/Problem';
import { Progress } from '../pages/Progress';
import { NotFound } from '../pages/NotFound';

export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[--bg] text-[--text]">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pattern/:patternSlug" element={<Pattern />} />
              <Route path="/pattern/:patternSlug/:problemSlug" element={<Problem />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </Providers>
  );
}
