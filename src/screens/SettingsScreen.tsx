import { useState } from 'react';
import type { Category, CurrencyCode } from '@/types';
import { Icon } from '@/components/Icon';
import { useApp } from '@/store';
import { useToast } from '@/store/ToastContext';
import { useScrollLock } from '@/lib/useScrollLock';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const COLOR_OPTIONS = ['#D4F26A', '#FFB4D1', '#9EE5C5', '#C7B8FF', '#FF8E72', '#FFD66B', '#A0D8FF', '#FFCBA0'];

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  useScrollLock(true);
  const { state, addCategory, updateCategory, deleteCategory, setDefaultCurrency } = useApp();
  const { showToast } = useToast();

  // Navigation
  const [screenStack, setScreenStack] = useState<string[]>(['main']);
  const currentScreen = screenStack[screenStack.length - 1];
  const goTo = (screen: string) => setScreenStack((prev) => [...prev, screen]);
  const goBack = () => setScreenStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  // Editor state
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('📝');
  const [catColor, setCatColor] = useState(COLOR_OPTIONS[0]);
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // All categories sorted: expense first, then income
  const allCategories = [...state.categories].sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === 'expense' ? -1 : 1;
  });

  const startAdd = () => {
    setEditingCat(null);
    setCatName('');
    setCatEmoji('📝');
    setCatColor(COLOR_OPTIONS[0]);
    setCatType('expense');
    setShowEmojiPicker(false);
    goTo('editor');
  };

  const startEdit = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatEmoji(cat.icon);
    setCatColor(cat.color);
    setCatType(cat.type);
    setShowEmojiPicker(false);
    goTo('editor');
  };

  const handleSave = () => {
    if (!catName.trim()) return;
    if (editingCat) {
      updateCategory({ ...editingCat, name: catName.trim(), icon: catEmoji, color: catColor, type: catType });
      showToast({ message: 'Категория обновлена', icon: '✅' });
    } else {
      addCategory({ name: catName.trim(), icon: catEmoji, color: catColor, type: catType });
      showToast({ message: 'Категория добавлена', icon: '✅' });
    }
    goBack();
  };

  const handleDelete = () => {
    if (!editingCat) return;
    const sameType = state.categories.filter((c) => c.type === editingCat.type);
    if (sameType.length <= 1) {
      showToast({ message: 'Нельзя удалить последнюю категорию этого типа', icon: '⚠️' });
      return;
    }
    deleteCategory(editingCat.id);
    showToast({ message: 'Категория удалена', icon: '🗑️' });
    goBack();
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'categories':
        return renderCategories();
      case 'editor':
        return renderEditor();
      default:
        return renderMain();
    }
  };

  // MAIN screen
  const renderMain = () => (
    <div className="flex-1 overflow-auto px-4">
      {/* Currency */}
      <div className="mb-6 rounded-card bg-card p-4">
        <div className="mb-3 text-[11px] font-semibold uppercase text-muted" style={{ letterSpacing: 1 }}>
          Валюта по умолчанию
        </div>
        <div className="flex gap-1 rounded-pill bg-bg p-1">
          {(['RUB', 'USD'] as CurrencyCode[]).map((c) => (
            <button
              key={c}
              onClick={() => setDefaultCurrency(c)}
              className="flex-1 rounded-pill border-none py-2.5 text-sm font-semibold transition-all"
              style={{
                background: state.defaultCurrency === c ? '#FFFFFF' : 'transparent',
                color: state.defaultCurrency === c ? '#1A1A1E' : '#7C7C82',
                cursor: 'pointer',
                boxShadow: state.defaultCurrency === c ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {c === 'RUB' ? '₽ Рубль' : '$ Доллар'}
            </button>
          ))}
        </div>
      </div>

      {/* Categories menu item */}
      <div className="mb-6 rounded-card bg-card overflow-hidden">
        <button
          onClick={() => goTo('categories')}
          className="flex w-full items-center gap-3 bg-transparent px-4 py-3.5 text-left"
          style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 36, height: 36, borderRadius: 12, background: '#EDE9E1', fontSize: 18 }}
          >
            📋
          </div>
          <span className="flex-1 text-[15px] font-medium text-fg">Категории</span>
          <span className="text-xs text-muted mr-1">{state.categories.length}</span>
          {Icon.chevRight('#7C7C82', 14)}
        </button>
      </div>

      {/* About */}
      <div className="mb-6 rounded-card bg-card p-4">
        <div className="mb-3 text-[11px] font-semibold uppercase text-muted" style={{ letterSpacing: 1 }}>
          О приложении
        </div>
        <div className="space-y-2 text-sm text-fg">
          <div className="flex justify-between">
            <span className="text-muted">Версия</span>
            <span>1.5.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Дата сборки</span>
            <span>{new Date().toLocaleDateString('ru-RU')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">GitHub</span>
            <span className="text-fg font-medium">kateio/kopeika</span>
          </div>
        </div>
      </div>
    </div>
  );

  // CATEGORIES LIST screen
  const renderCategories = () => (
    <div className="flex-1 overflow-auto px-4">
      <div className="rounded-card bg-card overflow-hidden">
        {allCategories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => startEdit(cat)}
            className="flex w-full items-center gap-3 bg-transparent px-4 py-3 text-left"
            style={{
              border: 'none',
              borderTop: i > 0 ? '1px solid #EDE9E1' : 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 36, height: 36, borderRadius: 12, background: cat.color, fontSize: 18 }}
            >
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium text-fg">{cat.name}</div>
              <div className="text-[12px] text-muted">{cat.type === 'expense' ? 'расход' : 'доход'}</div>
            </div>
            {Icon.chevRight('#7C7C82', 14)}
          </button>
        ))}
      </div>
      <button
        onClick={startAdd}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-button border-none py-3 text-sm font-semibold"
        style={{ background: '#D4F26A', color: '#000', cursor: 'pointer' }}
      >
        {Icon.plus('#000', 16)} Добавить категорию
      </button>
    </div>
  );

  // EDITOR screen
  const renderEditor = () => (
    <div className="flex-1 overflow-auto px-4">
      <div className="rounded-card bg-card p-4">
        {/* Name */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs text-muted">Название</div>
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Название категории"
            autoFocus
            className="w-full rounded-input border border-border bg-bg px-4 py-3 text-[15px] text-fg outline-none"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Emoji */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs text-muted">Иконка</div>
          <button
            onClick={() => setShowEmojiPicker((p) => !p)}
            className="flex items-center gap-3 rounded-input border border-border bg-bg px-4 py-3"
            style={{ cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
          >
            <span className="text-2xl">{catEmoji}</span>
            <span className="text-[15px] text-muted flex-1 text-left">
              {showEmojiPicker ? 'Закрыть' : 'Выбрать эмодзи'}
            </span>
          </button>
          {showEmojiPicker && (
            <div className="mt-2 overflow-hidden rounded-card" style={{ maxHeight: 300 }}>
              <Picker
                data={data}
                onEmojiSelect={(emoji: { native: string }) => {
                  setCatEmoji(emoji.native);
                  setShowEmojiPicker(false);
                }}
                locale="ru"
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
                maxFrequentRows={1}
              />
            </div>
          )}
        </div>

        {/* Color */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs text-muted">Цвет</div>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCatColor(c)}
                className="border-none"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: c,
                  cursor: 'pointer',
                  outline: catColor === c ? '2px solid #1A1A1E' : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs text-muted">Тип</div>
          <div className="flex gap-1 rounded-pill bg-bg p-1">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCatType(t)}
                className="flex-1 rounded-pill border-none py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: catType === t ? '#FFFFFF' : 'transparent',
                  color: catType === t ? '#1A1A1E' : '#7C7C82',
                  cursor: 'pointer',
                  boxShadow: catType === t ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {t === 'expense' ? 'Расход' : 'Доход'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-3">
        {editingCat && (
          <button
            onClick={handleDelete}
            className="flex-1 rounded-button border-none py-3.5 text-[15px] font-semibold"
            style={{ background: '#FEE2E2', color: '#DC2626', cursor: 'pointer' }}
          >
            Удалить
          </button>
        )}
        <button
          onClick={handleSave}
          className={`${editingCat ? 'flex-[2]' : 'flex-1'} rounded-button border-none py-3.5 text-[15px] font-semibold`}
          style={{ background: '#D4F26A', color: '#000', cursor: 'pointer' }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );

  // Header title and back button
  const screenTitle =
    currentScreen === 'categories'
      ? 'Категории'
      : currentScreen === 'editor'
        ? editingCat
          ? 'Редактирование'
          : 'Новая категория'
        : 'Настройки';
  const showBack = screenStack.length > 1;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease', overscrollBehavior: 'contain' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col bg-bg"
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '12px 0 30px',
          height: '90vh',
          maxHeight: '90vh',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Grabber */}
        <div className="mx-auto mb-4 rounded-full bg-border" style={{ width: 40, height: 5 }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={goBack}
                className="flex items-center border-none bg-transparent text-sm font-medium text-fg"
                style={{ cursor: 'pointer' }}
              >
                <span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>
                  {Icon.chevRight('#1A1A1E', 16)}
                </span>
              </button>
            )}
            <h2 className="text-xl font-bold text-fg" style={{ fontFamily: '"Inter Tight", inherit' }}>
              {screenTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-none bg-card"
            style={{ cursor: 'pointer' }}
          >
            {Icon.close('#7C7C82', 16)}
          </button>
        </div>

        {renderScreen()}
      </div>
    </div>
  );
}
