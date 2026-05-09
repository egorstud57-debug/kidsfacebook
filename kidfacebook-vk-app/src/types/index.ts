export type Gender = 'boy' | 'girl';

export type BookStyle = 'fairytale' | 'comic' | 'pixar';

export interface Interest {
  id: string;
  label: string;
  emoji: string;
  category: 'russian' | 'soviet' | 'modern' | 'themes';
}

export interface ChildData {
  name: string;
  age: number;
  gender: Gender;
}

export interface WizardState {
  step: number;
  photos: File[];
  photoUrls: string[];
  childData: ChildData;
  selectedInterests: string[];
  customInterest: string;
  bookStyle: BookStyle;
  isGenerating: boolean;
}

export interface VKUserData {
  id: number;
  firstName: string;
  lastName: string;
  photo: string;
}

export const INTERESTS: Interest[] = [
  { id: 'masha', label: 'Маша и Медведь', emoji: '🐻', category: 'russian' },
  { id: 'three-cats', label: 'Три кота', emoji: '🐱', category: 'russian' },
  { id: 'kolobok', label: 'Колобок', emoji: '🥯', category: 'russian' },
  { id: 'teremok', label: 'Теремок', emoji: '🏠', category: 'russian' },
  { id: 'prostokvashino', label: 'Простоквашино', emoji: '🐄', category: 'soviet' },
  { id: 'cheburashka', label: 'Чебурашка', emoji: '🍊', category: 'soviet' },
  { id: 'smeshariki', label: 'Смешарики', emoji: '🔵', category: 'modern' },
  { id: 'bogatyri', label: 'Богатыри', emoji: '⚔️', category: 'modern' },
  { id: 'fixiki', label: 'Фиксики', emoji: '🔧', category: 'modern' },
  { id: 'luntik', label: 'Лунтик', emoji: '🌙', category: 'modern' },
  { id: 'space', label: 'Космос', emoji: '🚀', category: 'themes' },
  { id: 'dinosaurs', label: 'Динозавры', emoji: '🦕', category: 'themes' },
  { id: 'princess', label: 'Принцессы', emoji: '👑', category: 'themes' },
  { id: 'pirates', label: 'Пираты', emoji: '🏴‍☠️', category: 'themes' },
  { id: 'superheroes', label: 'Супергерои', emoji: '🦸', category: 'themes' },
  { id: 'animals', label: 'Животные', emoji: '🦁', category: 'themes' },
];

export interface BookStyleOption {
  id: BookStyle;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
}

export const BOOK_STYLES: BookStyleOption[] = [
  {
    id: 'fairytale',
    title: 'Волшебная сказка',
    description: 'Классические иллюстрации в стиле русских народных сказок',
    emoji: '📖',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'comic',
    title: 'Комикс',
    description: 'Яркие картинки с пузырями диалогов',
    emoji: '💥',
    gradient: 'from-blue-400 to-purple-500',
  },
  {
    id: 'pixar',
    title: 'Pixar 3D',
    description: 'Объёмные персонажи как в мультфильмах Pixar',
    emoji: '✨',
    gradient: 'from-pink-400 to-rose-500',
  },
];
