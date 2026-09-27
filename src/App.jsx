import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import ScheduleView from './components/ScheduleView';
import DataSourceModal from './components/DataSourceModal';
import { fetchScheduleDatabase, processRawRows } from './services/sheetService';
import { DEFAULT_RAW_ROWS } from './constants/scheduleData';

export default function App() {
  // 登入狀態管理（以 sessionStorage 維持當前瀏覽階段之登入）
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('class_schedule_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return sessionStorage.getItem('class_schedule_user') || 'teacher';
  });

  // 課表資料庫狀態：預先以內建資料初始化，確保第一時間即有全部 123 班與 249 位教師
  const [db, setDb] = useState(() => {
    const initial = processRawRows(DEFAULT_RAW_ROWS);
    return {
      ...initial,
      isLive: false,
      error: null,
    };
  });
  const [loading, setLoading] = useState(false);

  // 查詢狀態：'class' | 'teacher'
  const [queryType, setQueryType] = useState('class');
  const [selectedItem, setSelectedItem] = useState('914');

  // 資料來源設定對話框
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  const googleSheetUrl = process.env.GOOGLE_SHEET_URL || '';

  // 載入課表資料
  const loadData = async (forceUrl) => {
    setLoading(true);
    try {
      const data = await fetchScheduleDatabase(forceUrl !== undefined ? forceUrl : googleSheetUrl);
      setDb(data);

      // 若當前選取的項目不在清單中，自動切換至存在的項目
      if (queryType === 'class') {
        if (!data.classes.includes(selectedItem)) {
          setSelectedItem(data.classes.includes('914') ? '914' : data.classes[0] || '');
        }
      } else {
        if (!data.teachers.includes(selectedItem)) {
          setSelectedItem(data.teachers.includes('曾佳菁') ? '曾佳菁' : data.teachers[0] || '');
        }
      }
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 登入與登出處理
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    sessionStorage.setItem('class_schedule_auth', 'true');
    sessionStorage.setItem('class_schedule_user', user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('class_schedule_auth');
    sessionStorage.removeItem('class_schedule_user');
  };

  // 點擊教師切換至該教師課表
  const handleSelectTeacher = (teacherName) => {
    if (!teacherName) return;
    setQueryType('teacher');
    setSelectedItem(teacherName);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // 點擊班級切換至該班級課表
  const handleSelectClass = (className) => {
    if (!className) return;
    setQueryType('class');
    setSelectedItem(className);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // 切換查詢模式
  const handleToggleQueryType = (type) => {
    setQueryType(type);
    if (type === 'class') {
      if (!db.classes.includes(selectedItem)) {
        setSelectedItem(db.classes.includes('914') ? '914' : db.classes[0] || '');
      }
    } else {
      if (!db.teachers.includes(selectedItem)) {
        setSelectedItem(db.teachers.includes('曾佳菁') ? '曾佳菁' : db.teachers[0] || '');
      }
    }
  };

  // 套用自訂上傳/貼上的 CSV 資料
  const handleApplyCustomData = (customDb) => {
    setDb(customDb);
    if (customDb.classes.length > 0) {
      setQueryType('class');
      setSelectedItem(customDb.classes.includes('914') ? '914' : customDb.classes[0]);
    }
  };

  // 列印課表
  const handlePrint = () => {
    window.print();
  };

  // 若尚未登入，顯示登入頁面
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-wrapper">
      {/* 頂部導覽列 */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onPrint={handlePrint}
        isLive={db.isLive}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* 核心內容區 */}
      <main className="main-content">
        <ScheduleView
          queryType={queryType}
          selectedItem={selectedItem}
          classes={db.classes}
          teachers={db.teachers}
          classGroups={db.classGroups}
          classSchedules={db.classSchedules}
          teacherSchedules={db.teacherSchedules}
          homerooms={db.homerooms}
          teacherHomerooms={db.teacherHomerooms}
          onSelectClass={handleSelectClass}
          onSelectTeacher={handleSelectTeacher}
          onToggleQueryType={handleToggleQueryType}
        />
      </main>

      {/* 資料來源管理對話框 */}
      <DataSourceModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        currentUrl={googleSheetUrl}
        isLive={db.isLive}
        error={db.error}
        onReloadLive={() => loadData(googleSheetUrl)}
        onApplyCustomData={handleApplyCustomData}
      />
    </div>
  );
}
