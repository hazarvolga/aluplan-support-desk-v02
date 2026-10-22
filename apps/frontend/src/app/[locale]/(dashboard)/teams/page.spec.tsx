import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamsPage from './page';

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    departments: vi.fn(),
    toast: vi.fn(),
    panelProps: vi.fn(),
    dialogProps: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ api: { teams: { list: mocks.list, departments: mocks.departments } } }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/team/AgentStatusBadge', () => ({
    AgentStatusBadge: ({ status }: { status: string }) => <span>status:{status}</span>,
}));
vi.mock('@/components/team/RoleBadge', () => ({
    RoleBadge: ({ role }: { role: string }) => <span>role:{role}</span>,
}));
vi.mock('@/components/team/TeamCreationPanel', () => ({
    TeamCreationPanel: (props: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) => {
        mocks.panelProps(props);
        return props.open ? <button type="button" onClick={props.onSuccess}>team-panel-success</button> : null;
    },
}));
vi.mock('@/components/users/user-dialog', () => ({
    UserDialog: (props: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) => {
        mocks.dialogProps(props);
        return props.open ? <button type="button" onClick={props.onSuccess}>user-dialog-success</button> : null;
    },
}));
vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));
vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => (
        <div data-active-tab={value}>
            <button type="button" onClick={() => onValueChange('departments')}>show-departments</button>
            <button type="button" onClick={() => onValueChange('teams')}>show-teams</button>
            <button type="button" onClick={() => onValueChange('agents')}>show-agents</button>
            {children}
        </div>
    ),
    TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => <section data-tab={value}>{children}</section>,
}));

const members = Array.from({ length: 6 }, (_, index) => ({
    roleOverride: index === 0 ? 'lead' : undefined,
    user: {
        id: `user-${index + 1}`,
        fullName: index === 0 ? 'Ada Lovelace' : `Agent ${index + 1}`,
        email: `agent${index + 1}@example.com`,
        avatarUrl: index === 1 ? 'https://cdn.example/avatar.png' : undefined,
        role: index === 2 ? { name: 'manager' } : undefined,
        agentStatus: index === 0 ? 'ONLINE' : undefined,
        _count: { ticketsAssigned: index === 0 ? 7 : 0 },
    },
}));

const teams = [
    {
        id: 'team-1',
        name: 'Alpha Support',
        autoAssignmentEnabled: true,
        assignmentStrategy: 'ROUND_ROBIN',
        department: { id: 'dept-1', name: 'Technical' },
        members,
    },
    { id: 'team-2', name: 'License Desk', department: { name: 'Licensing' } },
];

const departments = [
    {
        id: 'dept-1',
        name: 'Technical',
        slug: 'technical',
        description: 'Technical department',
        _count: { teams: 1 },
        slaPolicies: [
            { id: 'sla-1', priority: 'HIGH', firstResponseMinutes: 15 },
            { id: 'sla-2', priority: 'NORMAL', firstResponseMinutes: 60 },
            { id: 'sla-3', priority: 'LOW', firstResponseMinutes: 120 },
        ],
    },
    { id: 'dept-2', name: 'Licensing' },
];

describe('TeamsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.list.mockResolvedValue(teams);
        mocks.departments.mockResolvedValue(departments);
    });

    it('shows loading placeholders, then renders departments, teams and agent fallbacks', async () => {
        let resolveTeams!: (value: typeof teams) => void;
        mocks.list.mockReturnValueOnce(new Promise(resolve => { resolveTeams = resolve; }));
        render(<TeamsPage />);
        expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
        resolveTeams(teams);

        expect(await screen.findByText('Technical department')).toBeInTheDocument();
        expect(screen.getByText('no_description')).toBeInTheDocument();
        expect(screen.getByText('HIGH: 15min_suffix')).toBeInTheDocument();
        expect(screen.queryByText('LOW: 120min_suffix')).not.toBeInTheDocument();
        expect(screen.getByText('Alpha Support')).toBeInTheDocument();
        expect(screen.getByText('+1')).toBeInTheDocument();
        expect(screen.getByText('status:ONLINE')).toBeInTheDocument();
        expect(screen.getAllByText('status:OFFLINE')).toHaveLength(5);
        expect(screen.getByText('role:lead')).toBeInTheDocument();
        expect(screen.getByText('role:manager')).toBeInTheDocument();
        expect(screen.getAllByText('role:agent')).toHaveLength(4);
        expect(screen.getByText('7 / 5')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'actions.details' })[0]).toHaveAttribute('href', '/teams/departments/dept-1');
        expect(screen.getAllByRole('link', { name: 'actions.manage_team' })[0]).toHaveAttribute('href', '/teams/team-detail/team-1');
        expect(screen.getAllByRole('link', { name: 'actions.view_profile' })[0]).toHaveAttribute('href', '/teams/agents/user-1');
    });

    it('filters teams case-insensitively by team and department names', async () => {
        render(<TeamsPage />);
        await screen.findByText('Alpha Support');
        const search = screen.getByPlaceholderText('search_placeholder');

        fireEvent.change(search, { target: { value: 'license desk' } });
        expect(screen.getByText('License Desk')).toBeInTheDocument();
        expect(screen.queryByText('Alpha Support')).not.toBeInTheDocument();

        fireEvent.change(search, { target: { value: 'TECHNICAL' } });
        expect(screen.getByText('Alpha Support')).toBeInTheDocument();
        expect(screen.queryByText('License Desk')).not.toBeInTheDocument();
    });

    it('opens the team panel on team tabs and refetches after creation', async () => {
        render(<TeamsPage />);
        await screen.findByText('Alpha Support');
        fireEvent.click(screen.getByRole('button', { name: /actions.add_team/ }));
        expect(screen.getByRole('button', { name: 'team-panel-success' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'team-panel-success' }));
        await waitFor(() => {
            expect(mocks.list).toHaveBeenCalledTimes(2);
            expect(mocks.departments).toHaveBeenCalledTimes(2);
        });
    });

    it('switches to the agents action, opens the user dialog, and refetches after success', async () => {
        render(<TeamsPage />);
        await screen.findByText('Alpha Support');
        fireEvent.click(screen.getByRole('button', { name: 'show-agents' }));
        expect(screen.queryByRole('button', { name: /actions.add_team/ })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /actions.add_agent/ }));
        expect(screen.getByRole('button', { name: 'user-dialog-success' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'user-dialog-success' }));
        await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(2));
    });

    it('reports fetch failures and removes loading placeholders', async () => {
        mocks.departments.mockRejectedValueOnce(new Error('departments unavailable'));
        render(<TeamsPage />);

        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({
            title: 'error_title',
            description: 'fetch_error',
            variant: 'destructive',
        }));
        expect(document.querySelectorAll('.animate-pulse')).toHaveLength(0);
        expect(screen.queryByText('Alpha Support')).not.toBeInTheDocument();
    });
});
