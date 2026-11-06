import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { MultiCloudPolicyEngine } from './components/MultiCloudPolicyEngine';
import { ABACModule } from './components/ABACModule';
import { InlineDataPipeline } from './components/InlineDataPipeline';
import { JITKeyManagement } from './components/JITKeyManagement';
import { SecurityTelemetry } from './components/SecurityTelemetry';
import { ThreatDetection } from './components/ThreatDetection';
import { AuditLogs } from './components/AuditLogs';
import { ReportsModule } from './components/ReportsModule';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LoginPage } from './components/LoginPage';

import { 
  User, 
  UserRole, 
  CloudProvider, 
  PolicyRule, 
  FileItem, 
  EncryptionKey, 
  JITKeyRequest, 
  SecurityTelemetryEvent, 
  AuditLog, 
  ThreatAlert, 
  SecurityReport 
} from './types';

import { 
  INITIAL_USERS, 
  INITIAL_CLOUD_PROVIDERS, 
  INITIAL_POLICIES, 
  INITIAL_FILES, 
  INITIAL_KEYS, 
  INITIAL_JIT_REQUESTS, 
  INITIAL_TELEMETRY, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_THREATS, 
  INITIAL_REPORTS 
} from './data/initialData';

export default function App() {
  // Authentication & active user state
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Navigation View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  // App Datasets (Initialized with rich mock data + live REST API synchronization)
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>(INITIAL_CLOUD_PROVIDERS);
  const [policies, setPolicies] = useState<PolicyRule[]>(INITIAL_POLICIES);
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [keys, setKeys] = useState<EncryptionKey[]>(INITIAL_KEYS);
  const [jitRequests, setJitRequests] = useState<JITKeyRequest[]>(INITIAL_JIT_REQUESTS);
  const [telemetry, setTelemetry] = useState<SecurityTelemetryEvent[]>(INITIAL_TELEMETRY);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [threats, setThreats] = useState<ThreatAlert[]>(INITIAL_THREATS);
  const [reports, setReports] = useState<SecurityReport[]>(INITIAL_REPORTS);

  // Computed Security Index
  const activeThreatsCount = threats.filter(t => t.status === 'Active').length;
  const securityScore = Math.max(70, 98 - (activeThreatsCount * 4));

  // Sync state from server on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cloudRes, polRes, fileRes, keyRes, jitRes, telRes, audRes, thtRes] = await Promise.all([
          fetch('/api/cloud/providers').then(r => r.json()).catch(() => null),
          fetch('/api/policies').then(r => r.json()).catch(() => null),
          fetch('/api/files').then(r => r.json()).catch(() => null),
          fetch('/api/kms/keys').then(r => r.json()).catch(() => null),
          fetch('/api/kms/jit/requests').then(r => r.json()).catch(() => null),
          fetch('/api/telemetry').then(r => r.json()).catch(() => null),
          fetch('/api/audit').then(r => r.json()).catch(() => null),
          fetch('/api/threats').then(r => r.json()).catch(() => null)
        ]);

        if (cloudRes) setCloudProviders(cloudRes);
        if (polRes) setPolicies(polRes);
        if (fileRes) setFiles(fileRes);
        if (keyRes) setKeys(keyRes);
        if (jitRes) setJitRequests(jitRes);
        if (telRes) setTelemetry(telRes);
        if (audRes) setAuditLogs(audRes);
        if (thtRes) setThreats(thtRes);
      } catch (err) {
        console.log('API Sync initialization completed.');
      }
    };
    fetchData();
  }, []);

  // Handle Login & Authentication
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('dashboard');

    const loginEvt: SecurityTelemetryEvent = {
      id: `tel-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      source: 'Auth Engine',
      severity: 'Info',
      eventType: 'User Authenticated',
      userEmail: user.email,
      ipAddress: user.ipAddress || '103.21.124.50',
      location: user.location || 'Bangalore, IN',
      details: `User session authenticated for ${user.name} (${user.role}). Workspace optimized.`,
      status: 'Logged'
    };
    setTelemetry(prev => [loginEvt, ...prev]);
  };

  // Continue as Guest View Mode
  const handleContinueAsGuest = () => {
    const guestUser: User = {
      id: 'usr-guest',
      name: 'Guest Explorer',
      email: 'guest@securesaas.io',
      role: 'Guest',
      department: 'External',
      mfaEnabled: false,
      mfaVerified: false,
      lastLogin: 'Just now',
      status: 'Active',
      securityClearance: 'Confidential',
      deviceType: 'Personal Device',
      riskScore: 12,
      ipAddress: '103.21.124.50',
      location: 'Bangalore, IN'
    };
    setCurrentUser(guestUser);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          userName: currentUser.name,
          role: currentUser.role,
          ipAddress: currentUser.ipAddress,
          location: currentUser.location
        })
      });
    } catch (err) {
      console.log('Logout API call executed');
    }

    setIsAuthenticated(false);
    setActiveTab('login');

    const logoutEvt: SecurityTelemetryEvent = {
      id: `tel-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      source: 'Auth Engine',
      severity: 'Info',
      eventType: 'User Session Terminated',
      userEmail: currentUser.email,
      ipAddress: currentUser.ipAddress || '103.21.124.50',
      location: currentUser.location || 'Bangalore, IN',
      details: `User ${currentUser.name} logged out. Session JWT invalidated.`,
      status: 'Logged'
    };
    setTelemetry(prev => [logoutEvt, ...prev]);
  };

  // Handle Role Persona Switching
  const handleRoleChange = (newRole: UserRole) => {
    const targetUser = INITIAL_USERS.find(u => u.role === newRole) || {
      ...currentUser,
      role: newRole
    };
    setCurrentUser(targetUser as User);

    // Add telemetry log for persona switch
    const newEvt: SecurityTelemetryEvent = {
      id: `tel-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      source: 'Auth Engine',
      severity: 'Info',
      eventType: 'Role Persona Switched',
      userEmail: targetUser.email,
      ipAddress: targetUser.ipAddress,
      location: targetUser.location,
      details: `Active prototype role switched to ${newRole}. Clearance: ${targetUser.securityClearance}`,
      status: 'Logged'
    };
    setTelemetry(prev => [newEvt, ...prev]);
  };

  // API Handler: Create Policy
  const handleCreatePolicy = async (policyData: Partial<PolicyRule>) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData)
      });
      const data = await res.json();
      if (data.success) {
        setPolicies(prev => [data.policy, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // API Handler: Upload & Inline Encrypt File
  const handleUploadFile = async (formData: any) => {
    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ipAddress: currentUser.ipAddress,
          location: currentUser.location
        })
      });
      const data = await res.json();
      if (data.success) {
        setFiles(prev => [data.file, ...prev]);
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // API Handler: Decrypt File
  const handleDecryptFile = async (fileId: string) => {
    try {
      const res = await fetch('/api/files/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          userEmail: currentUser.email,
          userRole: currentUser.role,
          ipAddress: currentUser.ipAddress,
          location: currentUser.location
        })
      });
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  // API Handler: Request JIT Key
  const handleRequestJITKey = async (data: any) => {
    try {
      const res = await fetch('/api/kms/jit/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ipAddress: currentUser.ipAddress,
          location: currentUser.location
        })
      });
      const result = await res.json();
      if (result.success) {
        setJitRequests(prev => [result.request, ...prev]);
        // Re-fetch keys if ephemeral key was auto-generated
        const keyRes = await fetch('/api/kms/keys').then(r => r.json());
        if (keyRes) setKeys(keyRes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // API Handler: Approve JIT Key
  const handleApproveJITKey = async (requestId: string) => {
    try {
      const res = await fetch('/api/kms/jit/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          approverName: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setJitRequests(prev => prev.map(r => r.id === requestId ? data.request : r));
        setKeys(prev => [data.key, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // API Handler: Rotate Key
  const handleRotateKey = async (keyId: string) => {
    try {
      const res = await fetch('/api/kms/keys/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      });
      const data = await res.json();
      if (data.success) {
        setKeys(prev => prev.map(k => k.id === keyId ? data.key : k));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // API Handler: Mitigate Threat
  const handleMitigateThreat = async (threatId: string) => {
    try {
      const res = await fetch('/api/threats/mitigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threatId })
      });
      const data = await res.json();
      if (data.success) {
        setThreats(prev => prev.map(t => t.id === threatId ? data.threat : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated || activeTab === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLogin}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0C10] text-[#E2E8F0] font-sans antialiased selection:bg-blue-500 selection:text-white flex flex-col">
      
      {/* Top Navigation Header */}
      <Header
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onRoleChange={handleRoleChange}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        unreadAlertsCount={activeThreatsCount}
        securityScore={securityScore}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          threatsCount={activeThreatsCount}
          jitPendingCount={jitRequests.filter(r => r.status === 'Pending').length}
        />

        {/* View Content Display */}
        <main className="flex-1 p-5 md:p-6 overflow-y-auto bg-[#0A0C10]">

          {/* Logged Out Notice Banner */}
          {!isAuthenticated && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Session Logged Out</h4>
                  <p className="text-[11px] text-slate-300">You are currently in guest view mode. Log in to access encrypted vault pipelines, HSM keys, and policy controls.</p>
                </div>
              </div>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono transition-all self-start sm:self-auto shrink-0 shadow"
              >
                Sign In to Vault
              </button>
            </div>
          )}

          {activeTab === 'login' && (
            <LoginPage
              onLoginSuccess={handleLogin}
              onContinueAsGuest={handleContinueAsGuest}
            />
          )}

          {activeTab === 'overview' && (
            <LandingPage onLaunchDashboard={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'dashboard' && (
            <AdminDashboard
              users={INITIAL_USERS}
              cloudProviders={cloudProviders}
              files={files}
              keys={keys}
              threats={threats}
              telemetry={telemetry}
              securityScore={securityScore}
              onNavigateTab={setActiveTab}
              onMitigateThreat={handleMitigateThreat}
            />
          )}

          {activeTab === 'policy-engine' && (
            <MultiCloudPolicyEngine
              cloudProviders={cloudProviders}
              policies={policies}
              onCreatePolicy={handleCreatePolicy}
            />
          )}

          {activeTab === 'abac' && (
            <ABACModule />
          )}

          {activeTab === 'file-vault' && (
            <InlineDataPipeline
              files={files}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              onUploadFile={handleUploadFile}
              onDecryptFile={handleDecryptFile}
            />
          )}

          {activeTab === 'kms-jit' && (
            <JITKeyManagement
              keys={keys}
              jitRequests={jitRequests}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              onRequestJITKey={handleRequestJITKey}
              onApproveJITKey={handleApproveJITKey}
              onRotateKey={handleRotateKey}
            />
          )}

          {activeTab === 'telemetry' && (
            <SecurityTelemetry telemetry={telemetry} />
          )}

          {activeTab === 'threats' && (
            <ThreatDetection
              threats={threats}
              onMitigateThreat={handleMitigateThreat}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogs auditLogs={auditLogs} />
          )}

          {activeTab === 'reports' && (
            <ReportsModule reports={reports} />
          )}

        </main>
      </div>

      {/* Enterprise Status Footer */}
      <footer className="h-8 bg-[#0D1117] border-t border-white/5 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Node: US-EAST-B</span>
          <span>●</span>
          <span>Session: f92k-228l-00ps-91xz</span>
          <span>●</span>
          <span className="text-blue-400">AES-256 KMS Hardware Active</span>
        </div>
        <div className="flex items-center gap-4 uppercase">
          <span className="text-slate-400">FIPS 140-2 Level 3 Validated</span>
          <span className="text-slate-600 tracking-tighter">© 2026 AegisShield Security Systems</span>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => handleLogin(user)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        threats={threats}
      />

    </div>
  );
}
