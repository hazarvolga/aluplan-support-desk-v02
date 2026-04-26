'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import DOMPurify from 'dompurify';
import { X, ChevronLeft } from 'lucide-react';
import { useAnnouncementStore } from '@/stores/announcement-store';
import { api } from '@/lib/api';

interface AnnouncementLogItem {
  id: string;
  announcementId: string;
  sentAt: string | null;
  readAt: string | null;
  announcement: {
    title: string;
    contentMjml: string;
  };
}

export function AnnouncementArchiveDrawer() {
  const t = useTranslations('announcements');
  const format = useFormatter();
  const { isArchiveOpen, closeArchive, scrollToLogId, decrementUnread } = useAnnouncementStore();

  const [items, setItems] = useState<AnnouncementLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnnouncementLogItem | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // Fetch page 1 when drawer opens
  useEffect(() => {
    if (!isArchiveOpen) {
      // Reset state when closed
      setItems([]);
      setTotal(0);
      setPage(1);
      setSelectedItem(null);
      return;
    }

    fetchPage(1, true);
  }, [isArchiveOpen]);

  // Scroll to logId after data loads
  useEffect(() => {
    if (!scrollToLogId || items.length === 0) return;
    const el = itemRefs.current[scrollToLogId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [scrollToLogId, items]);

  const fetchPage = async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const res = await api.announcements.getMyAnnouncements(pageNum, 20);
      setItems((prev) => (reset ? res.data : [...prev, ...res.data]));
      setTotal(res.total);
      setPage(pageNum);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item: AnnouncementLogItem) => {
    setSelectedItem(item);

    if (item.readAt === null) {
      try {
        await api.announcements.markLogRead(item.id);
        decrementUnread();
        // Update local state to mark as read
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, readAt: new Date().toISOString() } : i
          )
        );
        setSelectedItem((prev) =>
          prev?.id === item.id ? { ...prev, readAt: new Date().toISOString() } : prev
        );
      } catch {
        // silently ignore
      }
    }
  };

  const sanitizeHtml = (html: string) => {
    if (typeof window === 'undefined') return html;
    return DOMPurify.sanitize(html);
  };

  if (!isArchiveOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeArchive}
      />

      {/* Drawer panel */}
      <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-[#111111] border-l border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          {selectedItem ? (
            <button
              onClick={() => setSelectedItem(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{t('archive_title')}</span>
            </button>
          ) : (
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t('archive_title')}
            </h2>
          )}
          <button
            onClick={closeArchive}
            className="rounded p-1 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedItem ? (
            /* Full content view */
            <div className="p-4">
              <h3 className="mb-2 text-base font-semibold text-white">
                {selectedItem.announcement.title}
              </h3>
              {selectedItem.sentAt && (
                <p className="mb-4 text-xs text-muted-foreground">
                  {format.dateTime(new Date(selectedItem.sentAt), {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              <div
                className="prose prose-invert prose-sm max-w-none text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(selectedItem.announcement.contentMjml),
                }}
              />
            </div>
          ) : (
            /* List view */
            <>
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  <span className="animate-pulse">Loading...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  {t('archive_empty')}
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      ref={(el) => { itemRefs.current[item.id] = el; }}
                    >
                      <button
                        onClick={() => handleItemClick(item)}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-start gap-3"
                      >
                        {/* Unread dot */}
                        <span className="mt-1.5 flex-shrink-0">
                          {item.readAt === null ? (
                            <span
                              className="block h-2 w-2 rounded-full bg-blue-500"
                              title={t('archive_unread_dot')}
                            />
                          ) : (
                            <span className="block h-2 w-2" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm ${
                              item.readAt === null
                                ? 'font-semibold text-white'
                                : 'font-normal text-muted-foreground'
                            }`}
                          >
                            {item.announcement.title}
                          </p>
                          {item.sentAt && (
                            <p className="mt-0.5 text-xs text-muted-foreground/60">
                              {format.dateTime(new Date(item.sentAt), {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Load more */}
              {items.length < total && (
                <div className="p-4">
                  <button
                    onClick={() => fetchPage(page + 1)}
                    disabled={loading}
                    className="w-full rounded border border-white/10 py-2 text-xs text-muted-foreground hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : t('load_more')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
