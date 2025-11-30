import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeContext';
import { SplashScreen } from './screens/SplashScreen.tsx';
import { WelcomeScreen, CreateWalletScreen, ImportWalletScreen } from './screens/WalletSetupScreens.tsx';
import { DashboardScreen } from './screens/DashboardScreen.tsx';
import { CoinDetailScreen } from './screens/CoinDetailScreen.tsx';
import { ChatbotScreen } from './screens/ChatbotScreen.tsx';
import { ActionScreen } from './screens/ActionScreen.tsx';
import { ProposalSummaryScreen } from './screens/ProposalSummaryScreen.tsx';
import { VotingFlowScreen } from './screens/VotingFlow.tsx';
import { TransactionHistoryScreen } from './screens/TransactionHistoryScreen.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';
import { NotificationSettingsScreen } from './screens/NotificationSettingsScreen.tsx';
import { ThemeSettingsScreen } from './screens/settings/ThemeSettingsScreen.tsx';
import { ProfileSettingsScreen } from './screens/settings/ProfileSettingsScreen.tsx';
import { RecoveryPhraseScreen } from './screens/settings/RecoveryPhraseScreen.tsx';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/create-wallet" element={<CreateWalletScreen />} />
            <Route path="/import-wallet" element={<ImportWalletScreen />} />
            
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/coin/:id" element={<CoinDetailScreen />} />
            <Route path="/chat" element={<ChatbotScreen />} />
            
            <Route path="/action/:type" element={<ActionScreen />} />
            <Route path="/proposal/:id" element={<ProposalSummaryScreen />} />
            <Route path="/vote/:id" element={<VotingFlowScreen />} />
            
            <Route path="/history" element={<TransactionHistoryScreen />} />
            
            {/* Settings Routes */}
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/settings/notifications" element={<NotificationSettingsScreen />} />
            <Route path="/settings/theme" element={<ThemeSettingsScreen />} />
            <Route path="/settings/profile" element={<ProfileSettingsScreen />} />
            <Route path="/settings/recovery" element={<RecoveryPhraseScreen />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;