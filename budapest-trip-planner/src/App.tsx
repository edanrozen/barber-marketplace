import { Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { TodayPage } from './pages/TodayPage';
import { CatalogPage } from './pages/CatalogPage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { UserStatePage } from './pages/UserStatePage';
import { ScheduleItemEditorPage } from './pages/ScheduleItemEditorPage';

export default function App(): JSX.Element {
  const { pathname } = useLocation();

  return (
    <AppShell>
      <ErrorBoundary key={pathname}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/place/:placeId" element={<PlaceDetailPage />} />
          <Route path="/state" element={<UserStatePage />} />
          <Route path="/schedule" element={<ScheduleItemEditorPage />} />
        </Routes>
      </ErrorBoundary>
    </AppShell>
  );
}
