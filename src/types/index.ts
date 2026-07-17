export type TimeOfDay = 'AM' | 'PM';

export interface RoutineStep {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  order: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  completedSteps: string[]; // step ids
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  notes: string;
  addedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: 'great' | 'good' | 'okay' | 'bad';
  notes: string;
  concerns: string[];
}

export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string; // YYYY-MM-DD
  note: string;
}

export interface MaskStock {
  name: string;
  start: number;
  used: number;
}

export interface MaskWeek {
  week: number;
  wednesday: string;
  sunday: string;
}

export interface MaskLog {
  date: string; // YYYY-MM-DD
  maskName: string;
}

export interface AppData {
  routineSteps: RoutineStep[];
  dailyLogs: DailyLog[];
  products: Product[];
  journalEntries: JournalEntry[];
  progressPhotos: ProgressPhoto[];
  streak: number;
  lastCompletedDate: string | null;
  maskStock: MaskStock[];
  maskLogs: MaskLog[];
}
