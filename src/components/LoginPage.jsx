import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Calendar, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // 取得環境變數或預設值
  const expectedAccount = process.env.ACCOUNT || 'teacher';
  const expectedPassword = process.env.PASSWORD || '66589422';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!account.trim() || !password.trim()) {
      setError('請輸入帳號與密碼');
      return;
    }

    if (account.trim() === expectedAccount && password.trim() === expectedPassword) {
      setError('');
      onLogin(account.trim());
    } else {
      setError('帳號或密碼錯誤，請重新確認');
    }
  };

  return (
    <div className="login-backdrop">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <Calendar size={32} />
          </div>
          <h1 className="login-title">錦和高中 課表系統</h1>
          <p className="login-subtitle">請輸入系統帳號與密碼以開始查詢課表</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="account">
              帳號 (Account)
            </label>
            <div className="form-input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="account"
                type="text"
                className="form-input"
                placeholder="請輸入帳號"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              密碼 (Password)
            </label>
            <div className="form-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            登入系統
          </button>
        </form>

        <div className="login-footer-hint">
          錦和高級中學 課務管理與排課查詢平台
        </div>
      </div>
    </div>
  );
}
