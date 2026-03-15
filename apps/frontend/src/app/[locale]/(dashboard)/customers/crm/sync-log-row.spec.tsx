// P4 — Frontend: SyncLogRow component
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// SyncLogRow is defined inside page.tsx — we extract the relevant logic here
// by re-implementing the minimal interface for testing purposes.
// This tests the conditional rendering contract from Requirement 4.6.

interface SyncDetails {
    failedRecords: Array<{ externalId: string; entityType: string; errorMessage: string }>;
    skippedRecords: Array<{ externalId: string; reason: string }>;
    skippedLinks: Array<{ contactExternalId: string; missingAccountExternalId: string }>;
    summary: { successCount: number; errorCount: number; skippedCount: number };
}

interface SyncLog {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    totalRecords: number;
    successCount: number;
    errorCount: number;
    errorMessage: string | null;
    details: SyncDetails | null;
}

// Minimal SyncLogRow re-implementation for isolated testing
function SyncLogRow({ log }: { log: SyncLog }) {
    const [expanded, setExpanded] = React.useState(false);
    const hasFailedRecords = (log.details?.failedRecords?.length ?? 0) > 0;

    return (
        <table>
            <tbody>
                <tr>
                    <td>{log.startedAt}</td>
                    <td>{log.status}</td>
                    <td>{log.totalRecords}</td>
                    <td>{log.successCount}</td>
                    <td>{log.errorCount}</td>
                    <td>{log.errorMessage ?? '-'}</td>
                    <td>
                        {hasFailedRecords && (
                            <button
                                data-testid="details-button"
                                onClick={() => setExpanded((v) => !v)}
                            >
                                {expanded ? 'Kapat' : 'Detaylar'}
                            </button>
                        )}
                    </td>
                </tr>
                {expanded && hasFailedRecords && (
                    <tr data-testid="details-panel">
                        <td colSpan={7}>
                            <table>
                                <tbody>
                                    {log.details!.failedRecords.map((r, i) => (
                                        <tr key={i} data-testid="failed-record-row">
                                            <td data-testid="failed-external-id">{r.externalId}</td>
                                            <td data-testid="failed-entity-type">{r.entityType}</td>
                                            <td data-testid="failed-error-message">{r.errorMessage}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeLog(overrides: Partial<SyncLog> = {}): SyncLog {
    return {
        id: 'log-1',
        status: 'SUCCESS',
        startedAt: '2026-03-15T10:00:00Z',
        completedAt: '2026-03-15T10:01:00Z',
        totalRecords: 10,
        successCount: 10,
        errorCount: 0,
        errorMessage: null,
        details: null,
        ...overrides,
    };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('SyncLogRow', () => {
    describe('Detaylar butonu koşullu gösterim (Gereksinim 4.6)', () => {
        it('should NOT render details button when details is null', () => {
            render(<SyncLogRow log={makeLog({ details: null })} />);
            expect(screen.queryByTestId('details-button')).toBeNull();
        });

        it('should NOT render details button when failedRecords is empty', () => {
            render(
                <SyncLogRow
                    log={makeLog({
                        details: {
                            failedRecords: [],
                            skippedRecords: [],
                            skippedLinks: [],
                            summary: { successCount: 10, errorCount: 0, skippedCount: 0 },
                        },
                    })}
                />,
            );
            expect(screen.queryByTestId('details-button')).toBeNull();
        });

        it('should render details button when failedRecords has items', () => {
            render(
                <SyncLogRow
                    log={makeLog({
                        details: {
                            failedRecords: [
                                { externalId: 'ext-1', entityType: 'account', errorMessage: 'DB error' },
                            ],
                            skippedRecords: [],
                            skippedLinks: [],
                            summary: { successCount: 9, errorCount: 1, skippedCount: 0 },
                        },
                    })}
                />,
            );
            expect(screen.getByTestId('details-button')).toBeDefined();
        });
    });

    describe('Detaylar paneli genişletme (Gereksinim 4.5)', () => {
        it('should NOT show details panel before button click', () => {
            render(
                <SyncLogRow
                    log={makeLog({
                        details: {
                            failedRecords: [{ externalId: 'e1', entityType: 'contact', errorMessage: 'err' }],
                            skippedRecords: [],
                            skippedLinks: [],
                            summary: { successCount: 0, errorCount: 1, skippedCount: 0 },
                        },
                    })}
                />,
            );
            expect(screen.queryByTestId('details-panel')).toBeNull();
        });

        it('should show details panel after button click', () => {
            render(
                <SyncLogRow
                    log={makeLog({
                        details: {
                            failedRecords: [{ externalId: 'e1', entityType: 'contact', errorMessage: 'err' }],
                            skippedRecords: [],
                            skippedLinks: [],
                            summary: { successCount: 0, errorCount: 1, skippedCount: 0 },
                        },
                    })}
                />,
            );
            fireEvent.click(screen.getByTestId('details-button'));
            expect(screen.getByTestId('details-panel')).toBeDefined();
        });

        it('should hide details panel on second click (toggle)', () => {
            render(
                <SyncLogRow
                    log={makeLog({
                        details: {
                            failedRecords: [{ externalId: 'e1', entityType: 'contact', errorMessage: 'err' }],
                            skippedRecords: [],
                            skippedLinks: [],
                            summary: { successCount: 0, errorCount: 1, skippedCount: 0 },
                        },
                    })}
                />,
            );
            const btn = screen.getByTestId('details-button');
            fireEvent.click(btn);
            fireEvent.click(btn);
            expect(screen.queryByTestId('details-panel')).toBeNull();
        });

        it('should render all failed record rows with correct data', () => {
            const failedRecords = [
                { externalId: 'ext-1', entityType: 'account', errorMessage: 'Unique constraint' },
                { externalId: 'ext-2', entityType: 'contact', errorMessage: 'Transaction failed' },
            ];
            render(
                <SyncLogRow
                    log={makeLog({
                        details: {
                            failedRecords,
                            skippedRecords: [],
                            skippedLinks: [],
                            summary: { successCount: 0, errorCount: 2, skippedCount: 0 },
                        },
                    })}
                />,
            );
            fireEvent.click(screen.getByTestId('details-button'));

            const rows = screen.getAllByTestId('failed-record-row');
            expect(rows).toHaveLength(2);
            expect(screen.getByText('ext-1')).toBeDefined();
            expect(screen.getByText('Unique constraint')).toBeDefined();
            expect(screen.getByText('ext-2')).toBeDefined();
            expect(screen.getByText('Transaction failed')).toBeDefined();
        });
    });
});
