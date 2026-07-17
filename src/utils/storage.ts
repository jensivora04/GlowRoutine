import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, RoutineStep } from '../types';

const STORAGE_KEY = '@GlowRoutine:data';

const defaultSteps: RoutineStep[] = [
  { id: '1', name: 'Cleanser', timeOfDay: 'AM', order: 1 },
  { id: '2', name: 'Toner', timeOfDay: 'AM', order: 2 },
  { id: '3', name: 'Serum', timeOfDay: 'AM', order: 3 },
  { id: '4', name: 'Moisturizer', timeOfDay: 'AM', order: 4 },
  { id: '5', name: 'Sunscreen', timeOfDay: 'AM', order: 5 },
  { id: '6', name: 'Makeup Remover', timeOfDay: 'PM', order: 1 },
  { id: '7', name: 'Cleanser', timeOfDay: 'PM', order: 2 },
  { id: '8', name: 'Toner', timeOfDay: 'PM', order: 3 },
  { id: '9', name: 'Serum', timeOfDay: 'PM', order: 4 },
  { id: '10', name: 'Night Cream', timeOfDay: 'PM', order: 5 },
];

export const defaultAppData: AppData = {
  routineSteps: defaultSteps,
  dailyLogs: [],
  products: [],
  journalEntries: [],
  progressPhotos: [],
  streak: 0,
  lastCompletedDate: null,
  maskStock: [
    { name: 'Medicube', start: 13, used: 0 },
    { name: 'Biodance', start: 24, used: 0 },
    { name: 'Mediheal Madecassoside', start: 22, used: 0 },
    { name: 'Mediheal Vita C', start: 8, used: 0 },
    { name: 'Mediheal Collagen', start: 11, used: 0 },
    { name: 'PRMR Mega Shot', start: 5, used: 0 },
    { name: 'Goodal Vita C', start: 7, used: 0 },
    { name: 'Abib Gummy Madecassoside', start: 12, used: 0 },
    { name: 'Abib Gummy Heartleaf', start: 5, used: 0 },
  ],
  maskLogs: [],
};

export async function loadData(): Promise<AppData> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return defaultAppData;
    return { ...defaultAppData, ...JSON.parse(json) };
  } catch {
    return defaultAppData;
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function calculateStreak(logs: AppData['dailyLogs'], lastCompleted: string | null): number {
  if (!lastCompleted) return 0;
  const today = todayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastCompleted !== today && lastCompleted !== yesterdayStr) return 0;

  let streak = 0;
  const check = new Date();
  if (lastCompleted === today) {
    // count backward from today
  } else {
    check.setDate(check.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = check.toISOString().split('T')[0];
    if (logs.find(l => l.date === dateStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
