import React, { useState, useEffect } from 'react';
import { authService, User } from './services/authService.ts';
import { disasterService, DisasterEvent } from './services/disasterService.ts';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { DashboardLayout, BeforeTab, DuringTab, DisasterMode } from './components/layout/DashboardLayout.tsx';

// Before Components
import { BeforeDashboardView } from './components/before/BeforeDashboardView.tsx';
import { HouseholdMembersView } from './components/before/HouseholdMembersView.tsx';
import { ShelterSelectionView } from './components/before/ShelterSelectionView.tsx';
import { ReconfirmationView } from './components/before/ReconfirmationView.tsx';
import { ExpectedOccupancyView } from './components/before/ExpectedOccupancyView.tsx';
import { PredictedThreatsView } from './components/before/PredictedThreatsView.tsx';
import { BeforeMapView } from './components/before/BeforeMapView.tsx';

// During Components
import { DuringDashboardView } from './components/during/DuringDashboardView.tsx';
import { AreYouSafeView } from './components/during/AreYouSafeView.tsx';
import { DuringBuildingsView } from './components/during/DuringBuildingsView.tsx';
import { DuringMapView } from './components/during/DuringMapView.tsx';
import { RescueOperationsView } from './components/during/RescueOperationsView.tsx';

import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Disaster Mode & Tabs
  const [mode, setMode] = useState<DisasterMode>('BEFORE');
  const [beforeTab, setBeforeTab] = useState<BeforeTab>('dashboard');
  const [duringTab, setDuringTab] = useState<DuringTab>('dashboard');

  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [activeDisaster, setActiveDisaster] = useState<DisasterEvent | null>(null);

  useEffect(() => {
    // Initial check of stored user
    const user = authService.getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
    setAuthChecking(false);
    loadDisasters();
  }, []);

  const loadDisasters = async () => {
    try {
      const list = await disasterService.getDisasters();
      setDisasters(list);
      if (list.length > 0) {
        setActiveDisaster(list[0]);
      }
    } catch (e) {
      console.error('Failed to load disasters:', e);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    loadDisasters();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Quick switch role between Citizen and Rescuer
  const handleSwitchRole = async (targetRole: 'CITIZEN' | 'RESCUER') => {
    try {
      if (targetRole === 'CITIZEN') {
        if (currentUser?.role === 'CITIZEN') return;
        const savedCitizenStr = localStorage.getItem('stride_saved_citizen');
        if (savedCitizenStr) {
          try {
            const parsed = JSON.parse(savedCitizenStr);
            setCurrentUser(parsed);
            localStorage.setItem('stride_user', JSON.stringify(parsed));
            return;
          } catch {
            // fallback
          }
        }
        const res = await authService.login({
          mobileNumber: '9840112345',
          password: 'stride123',
          role: 'CITIZEN',
        });
        setCurrentUser(res.user);
      } else {
        if (currentUser?.role === 'RESCUER') return;
        if (currentUser?.role === 'CITIZEN') {
          localStorage.setItem('stride_saved_citizen', JSON.stringify(currentUser));
        }
        const res = await authService.login({
          mobileNumber: '9880011223',
          password: 'stride123',
          role: 'RESCUER',
        });
        setCurrentUser(res.user);
      }
    } catch (e) {
      console.error('Failed to switch demo role:', e);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F4156]" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <DashboardLayout
      user={currentUser}
      mode={mode}
      onSwitchMode={(newMode) => setMode(newMode)}
      onLogout={handleLogout}
      activeBeforeTab={beforeTab}
      onSelectBeforeTab={(t) => setBeforeTab(t)}
      activeDuringTab={duringTab}
      onSelectDuringTab={(t) => setDuringTab(t)}
      onSwitchRole={handleSwitchRole}
      activeDisaster={activeDisaster}
      onSelectDisaster={(d) => setActiveDisaster(d)}
      disasters={disasters}
    >
      {/* MODE 1: BEFORE DISASTER (PREPAREDNESS) */}
      {mode === 'BEFORE' && (
        <>
          {beforeTab === 'dashboard' && (
            <BeforeDashboardView
              user={currentUser}
              activeDisaster={activeDisaster}
              onNavigateTab={(tab) => setBeforeTab(tab)}
            />
          )}

          {beforeTab === 'map' && (
            <BeforeMapView
              user={currentUser}
              activeDisaster={activeDisaster}
            />
          )}

          {beforeTab === 'household' && (
            <HouseholdMembersView
              user={currentUser}
              activeDisaster={activeDisaster}
            />
          )}

          {beforeTab === 'shelters' && (
            <ShelterSelectionView
              user={currentUser}
              activeDisaster={activeDisaster}
            />
          )}

          {beforeTab === 'reconfirmation' && (
            <ReconfirmationView
              user={currentUser}
              activeDisaster={activeDisaster}
            />
          )}

          {beforeTab === 'occupancy' && (
            <ExpectedOccupancyView
              user={currentUser}
              activeDisaster={activeDisaster}
            />
          )}

          {beforeTab === 'threats' && (
            <PredictedThreatsView
              user={currentUser}
              activeDisaster={activeDisaster}
              disasters={disasters}
              onSelectDisaster={(d) => setActiveDisaster(d)}
              onRefreshDisasters={loadDisasters}
            />
          )}
        </>
      )}

      {/* MODE 2: DURING DISASTER (LIVE INCIDENT COMMAND & RESCUE) */}
      {mode === 'DURING' && (
        <>
          {duringTab === 'dashboard' && (
            <DuringDashboardView
              user={currentUser}
              activeDisaster={activeDisaster}
              onNavigateTab={(t) => setDuringTab(t)}
            />
          )}

          {duringTab === 'safe' && (
            <AreYouSafeView
              user={currentUser}
              activeDisaster={activeDisaster}
              onNavigateTab={(t) => setDuringTab(t)}
            />
          )}

          {duringTab === 'buildings' && (
            <DuringBuildingsView
              user={currentUser}
              activeDisaster={activeDisaster}
            />
          )}

          {duringTab === 'maps' && (
            <DuringMapView
              user={currentUser}
              activeDisaster={activeDisaster}
            />
          )}

          {duringTab === 'rescue' && (
            <RescueOperationsView
              user={currentUser}
              activeDisaster={activeDisaster}
              onNavigateTab={(t) => setDuringTab(t)}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
