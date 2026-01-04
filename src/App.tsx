import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IntroPage, TestPage, ResultPage } from '@presentation/pages';
import './styles/global.css';

export function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
