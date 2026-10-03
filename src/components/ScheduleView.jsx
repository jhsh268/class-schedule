import React, { useState, useMemo } from 'react';
import { Search, Users, User, ArrowRightLeft, BookOpen, Clock, Award } from 'lucide-react';
import { PERIODS, DAYS } from '../constants/scheduleData';

export default function ScheduleView({
  queryType,           // 'class' | 'teacher'
  selectedItem,        // '914' | '曾佳菁'
  classes,             // string[]
  teachers,            // string[]
  classGroups,         // { [groupName]: string[] }
  classSchedules,      // { [className]: { [day]: { [period]: { subject, teacher } } } }
  teacherSchedules,    // { [teacherName]: { [day]: { [period]: { subject, className } } } }
  homerooms,           // { [className]: teacherName }
  teacherHomerooms,    // { [teacherName]: className }
  onSelectClass,       // (className) => void
  onSelectTeacher,     // (teacherName) => void
  onToggleQueryType,   // (type) => void
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isClassView = queryType === 'class';
  const currentSchedule = isClassView
    ? classSchedules[selectedItem] || {}
    : teacherSchedules[selectedItem] || {};

  // 取得該班級導師
  const tutorName = isClassView ? homerooms[selectedItem] : null;
  // 取得該教師擔任的導師班級（若有）
  const teacherHomeroomClass = !isClassView && teacherHomerooms ? teacherHomerooms[selectedItem] : null;

  // 全域智慧搜尋：無論目前在班級或教師模式，皆同時搜尋班級與教師（含常見別字相容）
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return { matchedClasses: [], matchedTeachers: [] };

    // 別字容錯：如搜尋「王鐸」自動對照「王繹」
    const aliasTerm = term.replace(/鐸/g, '繹');

    const matchedClasses = classes.filter((c) => c.toLowerCase().includes(term));
    const matchedTeachers = teachers.filter((t) =>
      t.toLowerCase().includes(term) || (aliasTerm !== term && t.toLowerCase().includes(aliasTerm))
    );

    return {
      matchedClasses: matchedClasses.slice(0, 15),
      matchedTeachers: matchedTeachers.slice(0, 15),
    };
  }, [searchTerm, classes, teachers]);

  const handleSelectClassItem = (c) => {
    onSelectClass(c);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleSelectTeacherItem = (t) => {
    onSelectTeacher(t);
    setSearchTerm('');
    setShowSuggestions(false);
  };



  return (
    <div className="schedule-container">
      {/* 搜尋與切換控制列（列印時自動隱藏） */}
      <div className="control-bar no-print">
        {/* 依班級 / 依教師 切換 */}
        <div className="search-toggle-group">
          <button
            className={`toggle-btn ${isClassView ? 'active' : ''}`}
            onClick={() => onToggleQueryType('class')}
          >
            <Users size={16} />
            <span>依班級查詢 ({classes.length} 班)</span>
          </button>
          <button
            className={`toggle-btn ${!isClassView ? 'active' : ''}`}
            onClick={() => onToggleQueryType('teacher')}
          >
            <User size={16} />
            <span>依教師查詢 ({teachers.length} 位)</span>
          </button>
        </div>

        {/* 全域智慧搜尋框：輸入班級或教師姓名皆可即時尋找 */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="輸入班級（如 914、101）或教師姓名（如 曾佳菁、李義國）..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
          />

          {showSuggestions && searchTerm.trim() && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                marginTop: '4px',
                boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.15)',
                zIndex: 50,
                maxHeight: '320px',
                overflowY: 'auto',
              }}
            >
              {/* 班級搜尋結果 */}
              {searchResults.matchedClasses.length > 0 && (
                <div>
                  <div style={{ padding: '0.4rem 0.75rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                    班級結果
                  </div>
                  {searchResults.matchedClasses.map((cls) => (
                    <div
                      key={`cls-${cls}`}
                      style={{
                        padding: '0.55rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                      onMouseDown={() => handleSelectClassItem(cls)}
                      className="suggestion-item"
                    >
                      <div>
                        <strong>{cls} 班</strong>
                        {homerooms[cls] && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                            (導師：{homerooms[cls]})
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        班級課表
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 教師搜尋結果 */}
              {searchResults.matchedTeachers.length > 0 && (
                <div>
                  <div style={{ padding: '0.4rem 0.75rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                    教師結果
                  </div>
                  {searchResults.matchedTeachers.map((tch) => (
                    <div
                      key={`tch-${tch}`}
                      style={{
                        padding: '0.55rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                      onMouseDown={() => handleSelectTeacherItem(tch)}
                      className="suggestion-item"
                    >
                      <div>
                        <strong>{tch} 老師</strong>
                        {teacherHomerooms?.[tch] && (
                          <span style={{ fontSize: '0.75rem', color: '#059669', marginLeft: '0.5rem', fontWeight: 600 }}>
                            ({teacherHomerooms[tch]} 導師)
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#059669', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        教師課表
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.matchedClasses.length === 0 && searchResults.matchedTeachers.length === 0 && (
                <div style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
                  查無符合「{searchTerm}」之班級或教師
                </div>
              )}
            </div>
          )}
        </div>

        {/* 快速選單下拉 */}
        <div className="quick-select-wrapper">
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {isClassView ? '選擇班級：' : '選擇教師：'}
          </span>

          {isClassView ? (
            <select
              className="select-dropdown"
              value={selectedItem}
              onChange={(e) => onSelectClass(e.target.value)}
            >
              {classGroups && Object.keys(classGroups).length > 0 ? (
                Object.entries(classGroups).map(([groupName, groupClasses]) => {
                  if (groupClasses.length === 0) return null;
                  return (
                    <optgroup key={groupName} label={groupName}>
                      {groupClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls} 班 {homerooms[cls] ? `(${homerooms[cls]} 導師)` : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                })
              ) : (
                classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls} 班 {homerooms[cls] ? `(${homerooms[cls]} 導師)` : ''}
                  </option>
                ))
              )}
            </select>
          ) : (
            <select
              className="select-dropdown"
              value={selectedItem}
              onChange={(e) => onSelectTeacher(e.target.value)}
            >
              {teachers.map((tch) => (
                <option key={tch} value={tch}>
                  {tch} 老師 {teacherHomerooms?.[tch] ? `(${teacherHomerooms[tch]} 導師)` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>


      {/* 課表本體卡片（螢幕與直式 A4 列印核心區域） */}
      <div className="schedule-card" id="printable-schedule">
        {/* 表頭區：完全對照錦和高中實體課表格式 */}
        <div className="schedule-header-banner">
          <h2 className="schedule-top-title">115學年度第一學期錦和高中課表</h2>
          <h1 className="schedule-main-title">
            錦和高中{isClassView ? '班級課表' : '教師課表'}
          </h1>

          <div className="schedule-meta-bar">
            {isClassView ? (
              <>
                <div className="meta-tutor">
                  導師：{tutorName ? tutorName : '—'}
                </div>
                <div className="meta-class">班級：{selectedItem}</div>
              </>
            ) : (
              <>
                <div className="meta-tutor">
                  教師：{selectedItem}
                  {teacherHomeroomClass && (
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, marginLeft: '0.4rem', color: '#1e40af' }}>
                      ({teacherHomeroomClass} 導師)
                    </span>
                  )}
                </div>
                <div className="meta-class">課表：個人課表</div>
              </>
            )}
          </div>
        </div>

        {/* 課表表格 */}
        <div className="table-responsive">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="col-period">節次</th>
                <th className="col-time"><span className="time-header-label">國中<br/>時間</span></th>
                <th className="col-time"><span className="time-header-label">高中<br/>時間</span></th>
                {DAYS.map((day) => (
                  <th key={day.id} className="col-day">
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => {
                // 午休列：橫跨整行
                if (period.isBreak) {
                  return (
                    <tr key="break" className="break-row">
                      <td colSpan={8}>午　　休</td>
                    </tr>
                  );
                }

                return (
                  <tr key={period.id}>
                    {/* 節次中文數字 */}
                    <td className="period-num">{period.name}</td>

                    {/* 國中作息時間 */}
                    <td className="time-slot">{period.jhsTime}</td>

                    {/* 高中作息時間 */}
                    <td className="time-slot">{period.shsTime}</td>

                    {/* 星期一至五之課程格子 */}
                    {DAYS.map((day) => {
                      const slot = currentSchedule[day.id]?.[period.id];

                      return (
                        <td key={day.id}>
                          <div className="schedule-cell">
                            {slot && slot.subject ? (
                              <>
                                <span className="cell-subject">{slot.subject}</span>
                                {isClassView ? (
                                  // 班級課表：顯示授課教師，點擊可直接跳轉至該教師課表
                                  slot.teacher ? (
                                    <button
                                      type="button"
                                      className="interactive-chip"
                                      onClick={() => onSelectTeacher(slot.teacher)}
                                      title={`點擊切換查看【${slot.teacher}】老師的課表`}
                                    >
                                      <span>{slot.teacher}</span>
                                    </button>
                                  ) : null
                                ) : (
                                  // 教師課表：顯示授課班級，點擊可直接跳轉至該班級課表
                                  slot.className ? (
                                    <button
                                      type="button"
                                      className="interactive-chip interactive-chip-class"
                                      onClick={() => onSelectClass(slot.className)}
                                      title={`點擊切換查看【${slot.className}】班的課表`}
                                    >
                                      <span>{slot.className}</span>
                                    </button>
                                  ) : null
                                )}
                              </>
                            ) : (
                              <span className="cell-empty no-print">—</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
