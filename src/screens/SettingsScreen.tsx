import { useState } from 'react';
import type { Category, CurrencyCode } from '@/types';
import { Icon } from '@/components/Icon';
import { useApp } from '@/store';
import { useToast } from '@/store/ToastContext';

interface SettingsScreenProps {
  onClose: () => void;
}

const EMOJI_OPTIONS = ['🍕', '🚕', '💅', '📱', '🎁', '🏠', '🎮', '💊', '👗', '☕', '💰', '💻', '🎵', '📚', '🏋️', '✈️', '🐶', '🎂'];
const COLOR_OPTIONS = ['#D4F26A', '#FFB4D1', '#9EE5C5', '#C7B8FF', '#FF8E72', '#FFD66B', '#A0D8FF', '#FFCBA0'];

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { state, addCategory, updateCategory, deleteCategory, setDefaultCurrency } = useApp();
  const { showToast } = useToast();

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [addingCat, setAddingCat] = useState<'expense' | 'income' | null>(null);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('📝');
  const [catColor, setCatColor] = useState(COLOR_OPTIONS[0]);
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');

  const expenseCats = state.categories.filter((c) => c.type === 'expense');
  const incomeCats = state.categories.filter((c) => c.type === 'income');

  const startAdd = (type: 'expense' | 'income') => {
    setAddingCat(type);
    setCatType(type);
    setCatName('');
    setCatEmoji('📝');
    setCatColor(COLOR_OPTIONS[0]);
    setEditingCat(null);
  };

  const startEdit = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatEmoji(cat.icon);
    setCatColor(cat.color);
    setCatType(cat.type);
    setAddingCat(null);
  };

  const handleSaveCategory = () => {
    if (!catName.trim()) return;
    if (editingCat) {
      updateCategory({ ...editingCat, name: catName.trim(), icon: catEmoji, color: catColor });
      setEditingCat(null);
      showToast({ message: 'Категория обновлена', icon: '✅' });
    } else {
      addCategory({ name: catName.trim(), icon: catEmoji, color: catColor, type: catType });
      setAddingCat(null);
      showToast({ message: 'Категория добавлена', icon: '✅' });
    }
    setCatName('');
  };

  const handleDeleteCategory = (cat: Category) => {
    const sameType = state.categories.filter((c) => c.type === cat.type);
    if (sameType.length <= 1) {
      showToast({ message: 'Нельзя удалить последнюю категорию этого типа', icon: '⚠️' });
      return;
    }
    const ok = deleteCategory(cat.id);
    if (ok) {
      showToast({ message: 'Категория удалена', icon: '🗑️' });
      if (editingCat?.id === cat.id) setEditingCat(null);
    }
  };

  const cancelEdit = () => {
    setEditingCat(null);
    setAddingCat(null);
    setCatName('');
  };

  const isEditing = editingCat !== null || addingCat !== null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col bg-bg"
        style={{
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
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
          <h2 className="text-xl font-bold text-fg" style={{ fontFamily: '"Inter Tight", inherit' }}>
            Настройки
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-none bg-card"
            style={{ cursor: 'pointer' }}
          >
            {Icon.close('#7C7C82', 16)}
          </button>
        </div>

        <div className="flex-1 overflow-auto px-4">
          {/* Currency */}
          <div className="mb-6 rounded-card bg-card p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase text-muted" style={{ letterSpacing: 1 }}>
              Валюта по умолчанию
            </div>
            <div className="flex gap-1 rounded-DEFAULT bg-bg p-1">
              {(['RUB', 'USD'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setDefaultCurrency(c)}
                  className="flex-1 rounded-[12px] border-none py-2.5 text-sm font-semibold transition-all"
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

          {/* Expense Categories */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-[11px] font-semibold uppercase text-muted" style={{ letterSpacing: 1 }}>
                Категории трат
              </div>
              <button
                onClick={() => startAdd('expense')}
                className="flex items-center gap-1 border-none bg-transparent text-xs font-medium text-fg"
                style={{ cursor: 'pointer' }}
              >
                {Icon.plus('#1A1A1E', 14)} Добавить
              </button>
            </div>
            <div className="rounded-card bg-card overflow-hidden">
              {expenseCats.map((cat, i) => (
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
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: cat.color,
                      fontSize: 18,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <span className="flex-1 text-[15px] font-medium text-fg">{cat.name}</span>
                  {Icon.chevRight('#7C7C82', 14)}
                </button>
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-[11px] font-semibold uppercase text-muted" style={{ letterSpacing: 1 }}>
                Категории дохода
              </div>
              <button
                onClick={() => startAdd('income')}
                className="flex items-center gap-1 border-none bg-transparent text-xs font-medium text-fg"
                style={{ cursor: 'pointer' }}
              >
                {Icon.plus('#1A1A1E', 14)} Добавить
              </button>
            </div>
            <div className="rounded-card bg-card overflow-hidden">
              {incomeCats.map((cat, i) => (
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
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: cat.color,
                      fontSize: 18,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <span className="flex-1 text-[15px] font-medium text-fg">{cat.name}</span>
                  {Icon.chevRight('#7C7C82', 14)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Editor inline */}
          {isEditing && (
            <div className="mb-6 rounded-card bg-card p-4">
              <div className="mb-3 text-[11px] font-semibold uppercase text-muted" style={{ letterSpacing: 1 }}>
                {editingCat ? 'Редактировать категорию' : 'Новая категория'}
              </div>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Название"
                className="mb-3 w-full rounded-DEFAULT border border-border bg-bg px-4 py-3 text-[15px] text-fg outline-none"
                style={{ fontFamily: 'inherit' }}
                autoFocus
              />
              <div className="mb-3">
                <div className="mb-1.5 text-xs text-muted">Иконка</div>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setCatEmoji(e)}
                      className="flex items-center justify-center border-none text-lg"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: catEmoji === e ? '#1A1A1E' : '#FAF8F4',
                        cursor: 'pointer',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <div className="mb-1.5 text-xs text-muted">Цвет</div>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCatColor(c)}
                      className="border-none"
                      style={{
                        width: 32,
                        height: 32,
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
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="flex-1 rounded-DEFAULT border border-border bg-transparent py-2.5 text-sm font-medium text-fg"
                  style={{ cursor: 'pointer' }}
                >
                  Отмена
                </button>
                {editingCat && (
                  <button
                    onClick={() => handleDeleteCategory(editingCat)}
                    className="rounded-DEFAULT border-none px-4 py-2.5 text-sm font-medium"
                    style={{ background: '#FEE2E2', color: '#DC2626', cursor: 'pointer' }}
                  >
                    Удалить
                  </button>
                )}
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 rounded-DEFAULT border-none py-2.5 text-sm font-semibold"
                  style={{ background: '#D4F26A', color: '#000', cursor: 'pointer' }}
                >
                  {editingCat ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </div>
          )}

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
      </div>
    </div>
  );
}
