import React, { useState } from 'react';
import { X, RefreshCw, Database, Upload, FileText, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { parseCustomCsv } from '../services/sheetService';

export default function DataSourceModal({
  isOpen,
  onClose,
  currentUrl,
  isLive,
  error,
  onReloadLive,
  onApplyCustomData,
}) {
  const [csvText, setCsvText] = useState('');
  const [importError, setImportError] = useState('');
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet' | 'csv'

  if (!isOpen) return null;

  const handleApplyCsv = () => {
    if (!csvText.trim()) {
      setImportError('請貼上 CSV 內容');
      return;
    }
    try {
      const data = parseCustomCsv(csvText);
      onApplyCustomData(data);
      setImportError('');
      onClose();
    } catch (err) {
      setImportError(err.message || 'CSV 解析失敗');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        try {
          const data = parseCustomCsv(content);
          onApplyCustomData(data);
          setImportError('');
          onClose();
        } catch (err) {
          setImportError(err.message || '檔案解析失敗');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Database size={20} color="#2563eb" />
            <span>課表資料來源管理</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'sheet' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('sheet')}
          >
            Google 試算表設定
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'csv' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('csv')}
          >
            自訂 CSV 匯入 / 貼上
          </button>
        </div>

        {activeTab === 'sheet' && (
          <div className="modal-body">
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
                目前環境變數設定之 Google Sheet 連結：
              </div>
              <div style={{
                background: '#f8fafc',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                wordBreak: 'break-all',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#0f172a' }}>{currentUrl || '未設定 GOOGLE_SHEET_URL'}</span>
                {currentUrl && (
                  <a href={currentUrl} target="_blank" rel="noreferrer" title="在瀏覽器開啟試算表" style={{ color: '#2563eb' }}>
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>
                當前讀取狀態：
              </div>
              {isLive ? (
                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span>已成功直接連線並讀取 Google Sheet 雲端資料</span>
                </div>
              ) : (
                <div style={{ background: '#fffbeb', color: '#92400e', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #fde68a', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>目前採用錦和高中 914 班與任課教師示範資料集</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      原因：試算表回傳 401 需權限驗證。系統已為您平滑切換，所有課表查詢、雙向點擊跳轉與直式 A4 列印功能皆可正常運作！
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                💡 如何開啟 Google Sheet 公開存取權（免授權即時同步）：
              </h4>
              <div className="guide-step">
                <div className="guide-number">1</div>
                <div>打開 Google 試算表，點擊右上角藍色<strong>「共用」</strong>按鈕。</div>
              </div>
              <div className="guide-step">
                <div className="guide-number">2</div>
                <div>在「一般存取權」中，將權限改為<strong>「知道連結的使用者均可查看」</strong>。</div>
              </div>
              <div className="guide-step">
                <div className="guide-number">3</div>
                <div>（建議方式）點擊選單<strong>「檔案」&gt;「共用」&gt;「發布到網路」</strong>，格式選擇<strong>「逗號分隔值 (.csv)」</strong>後點擊「發布」。</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                關閉
              </button>
              <button className="btn btn-primary" onClick={onReloadLive}>
                <RefreshCw size={16} />
                重新連線檢查
              </button>
            </div>
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
              您也可以直接貼上或上傳課表 CSV 檔案，系統會立即解析並建立班級與教師課表：
            </p>

            {importError && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                {importError}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                貼上 CSV 內容（欄位需包含 teachername、s11~s59、c11~c59 或 classname）：
              </label>
              <textarea
                className="csv-textarea"
                placeholder="teachername,s11,c11,s12,c12...&#10;曾佳菁,科學探索,914,理化,915..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  從電腦上傳 CSV 檔案
                  <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={onClose}>
                  取消
                </button>
                <button className="btn btn-primary" onClick={handleApplyCsv}>
                  <FileText size={16} />
                  套用此 CSV 資料
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
