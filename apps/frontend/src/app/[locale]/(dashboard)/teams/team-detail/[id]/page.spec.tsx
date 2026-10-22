import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamDetailPage from './page';

const mocks = vi.hoisted(() => ({
    get: vi.fn(), getStats: vi.fn(), update: vi.fn(), removeMember: vi.fn(), toast: vi.fn(), push: vi.fn(), back: vi.fn(), addProps: vi.fn(),
    router: { push: vi.fn(), back: vi.fn() },
}));
vi.mock('@/lib/api', () => ({ api: { teams: { get: mocks.get, getStats: mocks.getStats, update: mocks.update, removeMember: mocks.removeMember } } }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'team-1' }), useRouter: () => mocks.router }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/team/AgentStatusBadge', () => ({ AgentStatusBadge: ({ status }: { status: string }) => <span>status:{status}</span> }));
vi.mock('@/components/team/RoleBadge', () => ({ RoleBadge: ({ role }: { role: string }) => <span>role:{role}</span> }));
vi.mock('@/components/team/TeamMemberAddDialog', () => ({ TeamMemberAddDialog: (props: { open: boolean; onSuccess: () => void }) => {
    mocks.addProps(props); return props.open ? <button onClick={props.onSuccess}>add-success</button> : null;
} }));
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));
vi.mock('@/components/ui/select', () => ({
    Select: ({ children, onValueChange }: { children: React.ReactNode; onValueChange: (value: string) => void }) => <div><button onClick={() => onValueChange('SKILL_BASED')}>choose-skill</button>{children}</div>,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, SelectItem: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => open ? <div>{children}</div> : null,
    DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

const team = {
    id: 'team-1', name: 'Alpha Team', description: 'Critical support', autoAssignmentEnabled: true, assignmentStrategy: 'ROUND_ROBIN',
    department: { name: 'Technical' }, members: [
        { roleOverride: 'lead', user: { id: 'u1', fullName: 'Ada', email: 'ada@example.com', status: 'ACTIVE', role: { name: 'ADMIN' }, agentStatus: 'ONLINE', _count: { ticketsAssigned: 7 } } },
        { user: { id: 'u2', fullName: 'Customer', status: 'ACTIVE', role: 'CUSTOMER', _count: { ticketsAssigned: 0 } } },
        { user: { id: 'u3', fullName: 'Inactive Agent', status: 'PASSIVE', role: 'AGENT', _count: { ticketsAssigned: 2 } } },
    ],
};

describe('TeamDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.router.push = mocks.push;
        mocks.router.back = mocks.back;
        mocks.get.mockResolvedValue(team);
        mocks.getStats.mockResolvedValue({ onlineRate: 67, waitingQueue: 3, resolvedToday: 11 });
        mocks.update.mockResolvedValue({ assignmentStrategy: 'SKILL_BASED', autoAssignmentEnabled: false });
        mocks.removeMember.mockResolvedValue(undefined);
    });

    it('loads team and stats, filters assignable agents and renders bounded load', async () => {
        render(<TeamDetailPage />);
        expect(screen.getByText('loading.team')).toBeInTheDocument();
        expect(await screen.findByText('Alpha Team')).toBeInTheDocument();
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
        expect(screen.getByText('7 / 5')).toBeInTheDocument();
        expect(screen.getByText('%67')).toBeInTheDocument();
        expect(screen.getByText('11')).toBeInTheDocument();
        expect(screen.getByText('role:lead')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'actions.view_profile' })[0]).toHaveAttribute('href', '/teams/agents/u1');
        fireEvent.click(screen.getByRole('button', { name: 'nav.back' }));
        expect(mocks.back).toHaveBeenCalledOnce();
    });

    it('updates routing configuration and reports success without losing team data', async () => {
        render(<TeamDetailPage />);
        await screen.findByText('Alpha Team');
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: 'choose-skill' }));
        fireEvent.click(screen.getByRole('button', { name: 'routing.save' }));
        await waitFor(() => expect(mocks.update).toHaveBeenCalledWith('team-1', { autoAssignmentEnabled: false, assignmentStrategy: 'SKILL_BASED' }));
        expect(mocks.toast).toHaveBeenCalledWith({ title: 'routing.success_title', description: 'routing.success_desc' });
        expect(screen.getByText('Alpha Team')).toBeInTheDocument();
    });

    it('confirms member removal, updates the member count and handles API failure', async () => {
        render(<TeamDetailPage />);
        await screen.findByText('Alpha Team');
        const trashButtons = document.querySelectorAll('.lucide-trash-2');
        fireEvent.click(trashButtons[0].closest('button')!);
        expect(screen.getByText('member_remove.title')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'member_remove.cancel' }));
        expect(screen.queryByText('member_remove.title')).not.toBeInTheDocument();
        fireEvent.click(document.querySelector('.lucide-trash-2')!.closest('button')!);
        fireEvent.click(screen.getByRole('button', { name: 'member_remove.submit' }));
        await waitFor(() => expect(mocks.removeMember).toHaveBeenCalledWith('team-1', 'u1'));
        expect(screen.queryByText('Ada')).not.toBeInTheDocument();

        mocks.removeMember.mockRejectedValueOnce(new Error('failure'));
        fireEvent.click(document.querySelector('.lucide-trash-2')!.closest('button')!);
        fireEvent.click(screen.getByRole('button', { name: 'member_remove.submit' }));
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive', title: 'member_remove.error_title' })));
    });

    it('refreshes after adding a member and handles fetch and routing errors', async () => {
        const view = render(<TeamDetailPage />);
        await screen.findByText('Alpha Team');
        fireEvent.click(screen.getByRole('button', { name: 'actions.add_member' }));
        fireEvent.click(screen.getByRole('button', { name: 'add-success' }));
        await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(2));

        mocks.update.mockRejectedValueOnce(new Error('save failed'));
        fireEvent.click(screen.getByRole('button', { name: 'routing.save' }));
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive', title: 'routing.error_title' })));

        view.unmount();
        mocks.get.mockRejectedValueOnce(new Error('unavailable'));
        render(<TeamDetailPage />);
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/teams'));
        expect(mocks.toast).toHaveBeenCalledWith({ title: 'Hata', description: 'Ekip bilgileri alınamadı.', variant: 'destructive' });
    });
});
