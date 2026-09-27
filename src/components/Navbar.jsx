import React from 'react';
import { Calendar, Printer, Database, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  onPrint,
  isLive,
  onOpenDataModal,
}) {
  return (
    <header className="navbar no-print">
      <div className="navbar-container">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <Calendar size={22} />
          </div>
          <div>
            <div className="brand-text-title">錦和高中 課表查詢系統</div>
            <div className="brand-text-sub">115學年度 第一學期課表平台</div>
          </div>
        </div>

        <div className="nav-actions">
          {/* 資料來源狀態徽章 */}
          <button
            className={`status-pill ${isLive ? 'status-live' : 'status-demo'}`}
            onClick={onOpenDataModal}
            title="點擊檢視資料來源狀態與設定"
            style={{ cursor: 'pointer', border: 'none' }}
          >
            <span className={`status-dot ${isLive ? 'live-pulse' : ''}`} />
            <span>{isLive ? 'Google Sheet 雲端連線' : '示範資料 (錦和高中)'}</span>
            <Database size={13} style={{ marginLeft: '2px', opacity: 0.8 }} />
          </button>

          {/* 列印按鈕 */}
          <button className="btn btn-primary" onClick={onPrint} title="以直式 A4 大小列印目前課表 (Ctrl + P)">
            <Printer size={16} />
            <span>列印課表</span>
          </button>

          {/* 使用者資訊與登出 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                padding: '0.35rem 0.65rem',
                background: '#f1f5f9',
                borderRadius: '6px',
              }}
            >
              <User size={15} color="#2563eb" />
              <span>{user || 'teacher'}</span>
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={onLogout}
              title="登出系統"
              style={{ padding: '0.4rem' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
