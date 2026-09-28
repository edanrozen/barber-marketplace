import type { PropsWithChildren } from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  return (
    <div className="flex h-dvh flex-col bg-base-bg">
      <TopBar />
      <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
