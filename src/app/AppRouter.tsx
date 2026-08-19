import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '../shared/components/Navbar';
import { MobileBottomNav } from '../shared/components/MobileBottomNav';
import { Footer } from '../shared/components/Footer';

import { Home } from './Home';
import { CampaignList } from '../features/campaigns/CampaignList';
import { CaseFormMultiStep } from '../features/cases/CaseFormMultiStep';
import { PublicNeedsCatalog } from '../features/needs/PublicNeedsCatalog';
import { DonationForm } from '../features/donations/DonationForm';
import { VolunteersPage } from '../features/volunteers/VolunteersPage';
import { DashboardPage } from './DashboardPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/campanas" element={<CampaignList />} />
            <Route path="/solicitar-ayuda" element={<CaseFormMultiStep />} />
            <Route path="/necesidades-publicas" element={<PublicNeedsCatalog />} />
            <Route path="/donar" element={<DonationForm />} />
            <Route path="/voluntarios" element={<VolunteersPage />} />
            <Route path="/panel" element={<DashboardPage />} />
          </Routes>
        </main>

        <Footer />
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
};
