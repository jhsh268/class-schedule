import Papa from 'papaparse';
import { DEFAULT_RAW_ROWS } from '../constants/scheduleData';

/**
 * 將 Google Sheet 的各類 URL 轉換為 CSV 匯出連結
 */
export function getGoogleSheetCsvUrl(sheetUrl) {
  if (!sheetUrl) return '';

  // 若已經包含 output=csv 或以 .csv 結尾，直接使用
  if (sheetUrl.includes('output=csv') || sheetUrl.endsWith('.csv')) {
    return sheetUrl;
  }

  // 處理 pubhtml 轉 pub?output=csv
  if (sheetUrl.includes('/pubhtml')) {
    return sheetUrl.replace('/pubhtml', '/pub?output=csv');
  }

  // 處理標準 Google Sheet /d/{id}/edit 格式
  const matches = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matches && matches[1]) {
    const sheetId = matches[1];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  }

  return sheetUrl;
}

/**
 * 智慧解析原始資料列（支援從 Google Sheet CSV 或預設資料物件陣列解析）
 * 建立雙向索引：班級課表、教師課表、導師對應表
 */
export function processRawRows(rows) {
  const teacherSchedules = {}; // { [teacherName]: { [day]: { [period]: { subject, className } } } }
  const classSchedules = {};   // { [className]: { [day]: { [period]: { subject, teacher } } } }
  const homeroomMap = {};      // { [className]: teacherName } (班級 -> 導師)
  const teacherHomeroomMap = {}; // { [teacherName]: className } (導師 -> 帶領班級)
  const teacherListSet = new Set();
  const classListSet = new Set();

  rows.forEach((row) => {
    // 欄位標準化：小寫並去除前後空白
    const normalizedRow = {};
    for (const [key, value] of Object.entries(row)) {
      if (key && typeof key === 'string') {
        normalizedRow[key.trim().toLowerCase()] = typeof value === 'string' ? value.trim() : (value || '');
      }
    }

    const teacherName = (
      normalizedRow.teachername ||
      normalizedRow.teacher ||
      normalizedRow['教師姓名'] ||
      normalizedRow['教師'] ||
      ''
    ).trim();

    const rowClassName = (
      normalizedRow.classname ||
      normalizedRow.class ||
      normalizedRow['班級'] ||
      normalizedRow['班級名稱'] ||
      ''
    ).trim();

    if (teacherName) {
      teacherListSet.add(teacherName);
      if (!teacherSchedules[teacherName]) {
        teacherSchedules[teacherName] = {};
      }
    }

    if (rowClassName) {
      classListSet.add(rowClassName);
      if (!classSchedules[rowClassName]) {
        classSchedules[rowClassName] = {};
      }
    }

    // 檢查 5 天 x 9 節課：s11 ~ s59, c11 ~ c59
    for (let day = 1; day <= 5; day++) {
      for (let period = 1; period <= 9; period++) {
        const sKey = `s${day}${period}`;
        const cKey = `c${day}${period}`;

        const subject = normalizedRow[sKey] ? normalizedRow[sKey].trim() : '';
        const target = normalizedRow[cKey] ? normalizedRow[cKey].trim() : '';

        if (!subject && !target) continue;

        // 情況 A：此列代表一位「教師」，target 代表其授課「班級」
        if (teacherName) {
          if (!teacherSchedules[teacherName][day]) {
            teacherSchedules[teacherName][day] = {};
          }
          teacherSchedules[teacherName][day][period] = {
            subject,
            className: target,
          };

          if (target) {
            classListSet.add(target);
            if (!classSchedules[target]) {
              classSchedules[target] = {};
            }
            if (!classSchedules[target][day]) {
              classSchedules[target][day] = {};
            }
            classSchedules[target][day][period] = {
              subject,
              teacher: teacherName,
            };

            // 導師精準判定：凡是在該班上「班會」、「導師時間」或科目含「班會」的教師，即為該班導師
            if (subject.includes('班會') || subject.includes('導師') || subject === '班會') {
              homeroomMap[target] = teacherName;
              teacherHomeroomMap[teacherName] = target;
            }
          }
        }
        // 情況 B：此列代表一個「班級」，target 代表其授課「教師」
        else if (rowClassName) {
          if (!classSchedules[rowClassName][day]) {
            classSchedules[rowClassName][day] = {};
          }
          classSchedules[rowClassName][day][period] = {
            subject,
            teacher: target,
          };

          if (target) {
            teacherListSet.add(target);
            if (!teacherSchedules[target]) {
              teacherSchedules[target] = {};
            }
            if (!teacherSchedules[target][day]) {
              teacherSchedules[target][day] = {};
            }
            teacherSchedules[target][day][period] = {
              subject,
              className: rowClassName,
            };

            if (subject.includes('班會') || subject.includes('導師') || subject === '班會') {
              homeroomMap[rowClassName] = target;
              teacherHomeroomMap[target] = rowClassName;
            }
          }
        }
      }
    }
  });

  // 常見別字 / 異體字相容對照表（例如：王鐸儼 <-> 王繹儼）
  const TEACHER_ALIASES = {
    '王鐸儼': '王繹儼',
  };

  // 為別字建立課表參照，確保搜尋或點擊別字時也能即時取得正確課表
  Object.entries(TEACHER_ALIASES).forEach(([alias, canonical]) => {
    if (teacherSchedules[canonical] && !teacherSchedules[alias]) {
      teacherSchedules[alias] = teacherSchedules[canonical];
    }
    if (teacherHomeroomMap[canonical] && !teacherHomeroomMap[alias]) {
      teacherHomeroomMap[alias] = teacherHomeroomMap[canonical];
    }
  });

  // 排序班級：按照年級分組排序（7年級、8年級、9年級、高一、高二、高三）
  const sortedClasses = Array.from(classListSet).sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      // 國中 7xx, 8xx, 9xx 排在前面或依照年級順序
      const orderA = numA >= 700 ? numA - 600 : numA + 300;
      const orderB = numB >= 700 ? numB - 600 : numB + 300;
      return orderA - orderB;
    }
    return a.localeCompare(b, 'zh-Hant');
  });

  // 班級年級分組（提供下拉選單分組呈現）
  const classGroups = {
    '國中七年級': [],
    '國中八年級': [],
    '國中九年級': [],
    '高中一年級': [],
    '高中二年級': [],
    '高中三年級': [],
    '其他 / 選修群組': [],
  };

  sortedClasses.forEach((cls) => {
    const n = parseInt(cls, 10);
    if (n >= 701 && n <= 799) classGroups['國中七年級'].push(cls);
    else if (n >= 801 && n <= 899) classGroups['國中八年級'].push(cls);
    else if (n >= 901 && n <= 999) classGroups['國中九年級'].push(cls);
    else if (n >= 101 && n <= 199) classGroups['高中一年級'].push(cls);
    else if (n >= 201 && n <= 299) classGroups['高中二年級'].push(cls);
    else if (n >= 301 && n <= 399) classGroups['高中三年級'].push(cls);
    else classGroups['其他 / 選修群組'].push(cls);
  });

  // 排序教師清單（筆劃 / 拼音）
  const sortedTeachers = Array.from(teacherListSet).sort((a, b) =>
    a.localeCompare(b, 'zh-Hant')
  );

  return {
    teachers: sortedTeachers,
    classes: sortedClasses,
    classGroups,
    teacherSchedules,
    classSchedules,
    homerooms: homeroomMap,
    teacherHomerooms: teacherHomeroomMap,
  };
}

/**
 * 載入課表資料：優先讀取 Google Sheet，若失敗則自動使用內建 249 位教師及 123 班之完整資料
 */
export async function fetchScheduleDatabase(sheetUrl) {
  const url = getGoogleSheetCsvUrl(sheetUrl);

  if (url) {
    try {
      const cacheBuster = url.includes('?') ? `&_t=${Date.now()}` : `?_t=${Date.now()}`;
      const response = await fetch(url + cacheBuster, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const text = await response.text();
        if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
          throw new Error('Google Sheet 需要權限驗證');
        }

        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        });

        if (parsed.data && parsed.data.length > 0) {
          const processed = processRawRows(parsed.data);
          return {
            ...processed,
            isLive: true,
            sourceUrl: url,
            error: null,
          };
        }
      } else {
        throw new Error(`Google Sheet 回傳 HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn('載入 Google Sheet 失敗，切換為內建示範資料:', err.message);
      const fallback = processRawRows(DEFAULT_RAW_ROWS);
      return {
        ...fallback,
        isLive: false,
        sourceUrl: url,
        error: err.message,
      };
    }
  }

  const fallback = processRawRows(DEFAULT_RAW_ROWS);
  return {
    ...fallback,
    isLive: false,
    sourceUrl: '',
    error: null,
  };
}

/**
 * 解析使用者自行上傳或貼上的 CSV 文字
 */
export function parseCustomCsv(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (!parsed.data || parsed.data.length === 0) {
    throw new Error('CSV 內容為空或格式無法辨識');
  }
  const processed = processRawRows(parsed.data);
  return {
    ...processed,
    isLive: true,
    sourceUrl: '自訂上傳 CSV',
    error: null,
  };
}
