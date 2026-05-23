import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { TeamsController } from '../../teams/teams.controller';
import { TicketsController } from '../../tickets/tickets.controller';

type ControllerClass = { prototype: Record<string, any> };

type RouteMetadata = {
    methodName: string;
    method: RequestMethod;
    path: string;
};

function routesFor(controller: ControllerClass): RouteMetadata[] {
    return Object.getOwnPropertyNames(controller.prototype)
        .filter((methodName) => methodName !== 'constructor')
        .map((methodName) => {
            const handler = controller.prototype[methodName];
            const path = Reflect.getMetadata(PATH_METADATA, handler);
            const method = Reflect.getMetadata(METHOD_METADATA, handler);

            return {
                methodName,
                method,
                path: Array.isArray(path) ? path.join('|') : path,
            };
        })
        .filter((route) => route.path !== undefined);
}

function expectRouteBefore(
    controller: ControllerClass,
    method: RequestMethod,
    earlierPath: string,
    laterPath: string,
) {
    const routes = routesFor(controller).filter((route) => route.method === method);
    const earlierIndex = routes.findIndex((route) => route.path === earlierPath);
    const laterIndex = routes.findIndex((route) => route.path === laterPath);

    expect({ earlierPath, laterPath, routes }).toEqual(expect.objectContaining({
        earlierPath,
        laterPath,
    }));
    expect(earlierIndex).toBeGreaterThanOrEqual(0);
    expect(laterIndex).toBeGreaterThanOrEqual(0);
    expect(earlierIndex).toBeLessThan(laterIndex);
}

describe('Controller route ordering', () => {
    it('keeps teams static routes before the dynamic team id route', () => {
        expectRouteBefore(TeamsController, RequestMethod.GET, 'skills', ':id');
        expectRouteBefore(TeamsController, RequestMethod.GET, 'agents/:id', ':id');
        expectRouteBefore(TeamsController, RequestMethod.PATCH, 'agents/me/status', ':id');
        expectRouteBefore(TeamsController, RequestMethod.PATCH, 'agents/me/profile', ':id');
    });

    it('keeps ticket static routes before dynamic ticket id routes', () => {
        expectRouteBefore(TicketsController, RequestMethod.GET, 'by-number/:number', ':id');
        expectRouteBefore(TicketsController, RequestMethod.PATCH, 'bulk', ':id');
    });
});
