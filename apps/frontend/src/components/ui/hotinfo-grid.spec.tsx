import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HotinfoGrid, type HotinfoData } from './hotinfo-grid';

const toastSuccess = vi.fn();

vi.mock('sonner', () => ({
    toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}));

const fullHotinfo: HotinfoData = {
    hotinfoLicense: { '#text': 'LIC-100' },
    hotinfoContactPhone: '+90 555 000 0000',
    hotinfoContactEmail: 'user@example.com',
    hotinfoContactName: 'Ada Lovelace',
    allplanVersion: '2026',
    allplanEdition: 'Engineering',
    allplanBuildId: 'B-42',
    allplanHotfix: 'HF-1',
    osVersion: 'Windows 11',
    cpu: 'Example CPU',
    ram: '32 GB',
    licenseType: '⚠ License service unavailable',
    licenseNumber: '12345',
    dotnetVersion: '4.8',
    graphicsCards: [
        {
            name: 'NVIDIA RTX 4090 / Intel UHD Graphics',
            vram: '24 GB',
            ram: '32 GB',
            resolution: '3840x2160',
            driverDate: '2026-10-01',
            driverVersion: '1.2.3',
            openglVersion: '4.6',
        },
    ],
    drives: [{ root: 'C:', fs: 'NTFS', free: '100 GB', total: '500 GB' }],
    printers: ['Office Printer', 'PDF Printer'],
    defaultPrinter: 'Office Printer',
    registryPaths: { InstallRoot: { '@_name': 'C:\\Program Files\\Allplan' } },
    conflictingProcesses: ['scanner.exe'],
    securityServices: ['Defender'],
    envVars: { COMPUTERNAME: 'WORKSTATION', USERNAME: 'user' },
};

describe('HotinfoGrid', () => {
    beforeEach(() => {
        toastSuccess.mockReset();
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: vi.fn().mockResolvedValue(undefined) },
        });
    });

    it('renders diagnostic details, expands registry data, and copies a complete summary', async () => {
        const user = userEvent.setup();
        const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
        render(<HotinfoGrid data={fullHotinfo} />);

        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getByText('NVIDIA RTX 4090')).toBeInTheDocument();
        expect(screen.getByText('Intel UHD Graphics')).toBeInTheDocument();
        expect(screen.getByText('Office Printer')).toBeInTheDocument();
        expect(screen.getByText('scanner.exe')).toBeInTheDocument();
        expect(screen.queryByText('C:\\Program Files\\Allplan')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /registry_paths/i }));
        expect(screen.getByText('C:\\Program Files\\Allplan')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'TÜMÜNÜ KOPYALA' }));
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Allplan: 2026 (Engineering)'));
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('GPU 2: Intel UHD Graphics'));
        expect(toastSuccess).toHaveBeenCalledWith('Özet kopyalandı');
        expect(screen.getByText('KOPYALANDI')).toBeInTheDocument();
    });

    it('uses legacy GPU fields in compact mode and omits desktop-only detail panels', () => {
        render(
            <HotinfoGrid
                variant="compact"
                data={{
                    allplanVersion: '2025',
                    gpu: { '@_version': 'AMD Radeon Pro / NVIDIA Quadro' },
                    vram: '8 GB',
                    gpuRam: '16 GB',
                    screenResolution: '1920x1080',
                    registryPaths: { Hidden: 'value' },
                    drives: [{ root: 'D:' }],
                    printers: ['Hidden printer'],
                }}
            />,
        );

        expect(screen.getByText('AMD Radeon Pro')).toBeInTheDocument();
        expect(screen.getByText('NVIDIA Quadro')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'TÜMÜNÜ KOPYALA' })).not.toBeInTheDocument();
        expect(screen.queryByText('Hidden printer')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /registry_paths/i })).not.toBeInTheDocument();
    });

    it('renders a translated empty state for missing data', () => {
        render(<HotinfoGrid data={null as unknown as HotinfoData} />);

        expect(screen.getByText('not_found')).toBeInTheDocument();
    });
});
