import { AnnouncementTemplatesService } from './announcement-templates.service';
import { ENTERPRISE_TEMPLATES } from './announcement-templates.defaults';
import { PrismaService } from '../prisma/prisma.service';

describe('announcement template startup seed', () => {
  it('preserves existing templates and is unchanged on a second startup', async () => {
    const defaultName = 'Olay Çözüldü – Teknik Rapor';
    expect(ENTERPRISE_TEMPLATES.some((template) => template.name === defaultName)).toBe(true);

    type Row = { id: string; name: string; contentMjml: string; updatedAt: string };
    let rows: Row[] = [
      { id: 'existing-default', name: defaultName, contentMjml: 'edited default', updatedAt: '2026-01-01' },
      { id: 'customer-created', name: 'Olay Çözüldü Teknik Rapor', contentMjml: 'customer text', updatedAt: '2026-02-01' },
    ];
    const findFirst = jest.fn().mockResolvedValue({ id: 'existing-admin' });
    const findMany = jest.fn().mockImplementation(async () => rows.map((row) => ({ ...row })));
    const createMany = jest.fn().mockImplementation(async ({ data, skipDuplicates }: {
      data: Array<{ name: string; contentMjml: string }>;
      skipDuplicates: boolean;
    }) => {
      expect(skipDuplicates).toBe(true);
      const newRows = data.filter((item) => !rows.some((row) => row.name === item.name))
        .map((item, index) => ({ id: `seed-${rows.length + index}`, name: item.name,
          contentMjml: item.contentMjml, updatedAt: '2026-03-01' }));
      rows = [...rows, ...newRows];
      return { count: newRows.length };
    });
    const update = jest.fn();
    const remove = jest.fn();
    const prisma = {
      user: { findFirst },
      announcementTemplate: { findMany, createMany, update, delete: remove },
    } as unknown as PrismaService;

    const service = new AnnouncementTemplatesService(prisma);
    expect(findFirst).not.toHaveBeenCalled();

    await service.onModuleInit();
    const firstRows = rows.map((row) => ({ ...row }));
    const firstCreateCount = createMany.mock.calls.length;
    expect(firstRows).toEqual(expect.arrayContaining([
      { id: 'existing-default', name: defaultName, contentMjml: 'edited default', updatedAt: '2026-01-01' },
      { id: 'customer-created', name: 'Olay Çözüldü Teknik Rapor', contentMjml: 'customer text', updatedAt: '2026-02-01' },
    ]));
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(firstCreateCount).toBe(1);
    expect(createMany.mock.calls[0][0].data).toHaveLength(ENTERPRISE_TEMPLATES.length - 1);

    await service.onModuleInit();
    expect(rows).toEqual(firstRows);
    expect(createMany).toHaveBeenCalledTimes(firstCreateCount);
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('uses unique-name conflict protection if two backends start together', async () => {
    const names = new Set<string>();
    const createMany = jest.fn().mockImplementation(async ({ data, skipDuplicates }) => {
      expect(skipDuplicates).toBe(true);
      let count = 0;
      for (const template of data) {
        if (names.has(template.name)) continue;
        names.add(template.name);
        count++;
      }
      return { count };
    });
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue(null) },
      announcementTemplate: {
        findMany: jest.fn().mockResolvedValue([]),
        createMany,
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as PrismaService;

    await Promise.all([
      new AnnouncementTemplatesService(prisma).onModuleInit(),
      new AnnouncementTemplatesService(prisma).onModuleInit(),
    ]);

    expect(names.size).toBe(ENTERPRISE_TEMPLATES.length);
    expect(createMany).toHaveBeenCalledTimes(2);
    expect(createMany.mock.calls[0][0].data[0].createdBy).toBeNull();
    expect(prisma.announcementTemplate.update).not.toHaveBeenCalled();
    expect(prisma.announcementTemplate.delete).not.toHaveBeenCalled();
  });

  it('does not write templates when the initial database read fails', async () => {
    const createMany = jest.fn();
    const prisma = {
      user: { findFirst: jest.fn().mockRejectedValue(new Error('synthetic read failure')) },
      announcementTemplate: { findMany: jest.fn(), createMany, update: jest.fn(), delete: jest.fn() },
    } as unknown as PrismaService;

    await expect(new AnnouncementTemplatesService(prisma).onModuleInit()).resolves.toBeUndefined();
    expect(prisma.announcementTemplate.findMany).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
    expect(prisma.announcementTemplate.update).not.toHaveBeenCalled();
    expect(prisma.announcementTemplate.delete).not.toHaveBeenCalled();
  });
});
