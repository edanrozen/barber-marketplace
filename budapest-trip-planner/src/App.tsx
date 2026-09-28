import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { TodayPage } from './pages/TodayPage';
import { CatalogPage } from './pages/CatalogPage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { UserStatePage } from './pages/UserStatePage';
import { ScheduleItemEditorPage } from './pages/ScheduleItemEditorPage';

export default function App(): JSX.Element {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/place/:placeId" element={<PlaceDetailPage />} />
        <Route path="/state" element={<UserStatePage />} />
        <Route path="/schedule" element={<ScheduleItemEditorPage />} />
      </Routes>
    </AppShell>
  );
}
