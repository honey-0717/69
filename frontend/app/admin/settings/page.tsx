'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, LogOut, Shield, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api-client';

export default function AdminSettingsPage() {
  const { user, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  async function changePassword() {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    const { error } = await apiRequest('/api/auth/password-change', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });

    if (error) {
      toast.error('Failed to change password: ' + error);
    } else {
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    }
    setChangingPassword(false);
  }

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Account and security settings</p>
      </div>

      {/* Account info */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
            <Mail size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Account</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
            <KeyRound size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Change Password</h3>
            <p className="text-xs text-muted-foreground">Update your admin password</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-white/5 border-white/10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-white/5 border-white/10 rounded-xl"
            />
          </div>
          <Button
            onClick={changePassword}
            disabled={changingPassword}
            className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl gap-2"
          >
            {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Change Password
          </Button>
        </div>
      </div>

      {/* Security info */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Security</h3>
            <p className="text-xs text-muted-foreground">Your admin session is protected</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-muted-foreground">Authentication</span>
            <span className="text-success text-xs">Secure HTTP-only Cookie Token</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-muted-foreground">Backend API Layer</span>
            <span className="text-success text-xs">Dockerized REST API (`/api/*`)</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Browser Supabase Exposure</span>
            <span className="text-success text-xs">Disabled (No Direct Access)</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="glass-card p-5 border-error/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center">
              <LogOut size={18} className="text-error" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Logout</h3>
              <p className="text-xs text-muted-foreground">Sign out of your admin account</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="rounded-xl border-error/30 text-error hover:bg-error/10 gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
