import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout/MainLayout';

import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

import { Dashboard } from '../pages/dashboard/Dashboard';
import { Apps } from '../pages/apps/Apps';
import { CreateApp } from '../pages/apps/CreateApp';
import { AppDetails } from '../pages/apps/AppDetails';
import { AppChannelDetails } from '../pages/apps/AppChannelDetails';

import { Channels } from '../pages/channels/Channels';
import { CreateChannel } from '../pages/channels/CreateChannel';
import { ChannelDetails } from '../pages/channels/ChannelDetails';

import { Resources } from '../pages/resources/Resources';
import { Chat } from '../pages/chat/Chat';

import { Profile } from '../pages/profile/Profile';
import { Settings } from '../pages/settings/Settings';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes (Auth) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes (Authenticated Workspace) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Applications */}
          <Route path="/apps" element={<Apps />} />
          <Route path="/apps/create" element={<CreateApp />} />
          <Route path="/apps/:appId" element={<AppDetails />} />
          <Route path="/apps/:appId/channel/:appChannelId" element={<AppChannelDetails />} />

          {/* Channels */}
          <Route path="/channels" element={<Channels />} />
          <Route path="/channels/create" element={<CreateChannel />} />
          <Route path="/channels/:channelId" element={<ChannelDetails />} />

          {/* Resources */}
          <Route path="/resources" element={<Resources />} />

          {/* Chat */}
          <Route path="/apps/:appId/chat" element={<Chat />} />
          <Route path="/apps/:appId/chat/:chatId" element={<Chat />} />

          {/* Profile (Dedicated Personal Profile Page) */}
          <Route path="/profile" element={<Profile />} />

          {/* Settings (Dedicated LLM Provider Settings Page) */}
          <Route path="/settings" element={<Settings />} />

          {/* Backwards Compatibility Navigation Aliases */}
          <Route path="/settings/profile" element={<Navigate to="/profile" replace />} />
          <Route path="/settings/providers" element={<Navigate to="/settings" replace />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
