import defaultCleanRows from './clean_rows.json';

// 節次與作息時間定義（完全對照錦和高中課表格式）
export const PERIODS = [
  { id: 1, name: '一', jhsTime: '08:15\n至\n09:00', shsTime: '08:10\n至\n09:00' },
  { id: 2, name: '二', jhsTime: '09:15\n至\n10:00', shsTime: '09:10\n至\n10:00' },
  { id: 3, name: '三', jhsTime: '10:15\n至\n11:00', shsTime: '10:10\n至\n11:00' },
  { id: 4, name: '四', jhsTime: '11:10\n至\n11:55', shsTime: '11:10\n至\n12:00' },
  { id: 'break', name: '午　　休', isBreak: true },
  { id: 5, name: '五', jhsTime: '13:05\n至\n13:50', shsTime: '13:00\n至\n13:50' },
  { id: 6, name: '六', jhsTime: '14:05\n至\n14:50', shsTime: '14:05\n至\n14:55' },
  { id: 7, name: '七', jhsTime: '15:05\n至\n15:50', shsTime: '15:05\n至\n15:55' },
  { id: 8, name: '八', jhsTime: '16:05\n至\n16:50', shsTime: '16:05\n至\n16:55' },
  { id: 9, name: '九', jhsTime: '──\n至\n──', shsTime: '──\n至\n──' },
];

export const DAYS = [
  { id: 1, name: '星期一' },
  { id: 2, name: '星期二' },
  { id: 3, name: '星期三' },
  { id: 4, name: '星期四' },
  { id: 5, name: '星期五' },
];

// 全校 249 位教師與 123 個班級之完整離線預設資料集（取材自錦和高中排課雲端資料）
export const DEFAULT_RAW_ROWS = defaultCleanRows;
