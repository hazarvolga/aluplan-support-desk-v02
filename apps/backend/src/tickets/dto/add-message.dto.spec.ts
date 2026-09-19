import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory';
import { SwaggerTypesMapper } from '@nestjs/swagger/dist/services/swagger-types-mapper';
import { AddMessageDto } from './add-message.dto';

describe('AddMessageDto attachment contract', () => {
    it.each([[], null, [{ url: 'tickets/msg_victim/private.pdf' }]])(
        'rejects supplied legacy inline attachment metadata: %p',
        async (attachments) => {
            const errors = await validate(plainToInstance(AddMessageDto, { message: 'Reply', attachments }));
            expect(errors.some(error => error.property === 'attachments')).toBe(true);
        },
    );

    it('accepts a public reply without inline attachment metadata', async () => {
        const errors = await validate(plainToInstance(AddMessageDto, {
            message: 'Reply', isInternal: false, contentFormat: 'HTML',
        }));
        expect(errors).toEqual([]);
    });

    it('does not advertise caller-controlled storage references in the OpenAPI schema', () => {
        const schemas: Record<string, any> = {};
        const factory = new SchemaObjectFactory(new ModelPropertiesAccessor(), new SwaggerTypesMapper());
        factory.exploreModelSchema(AddMessageDto, schemas);

        expect(schemas.AddMessageDto.properties).toHaveProperty('message');
        expect(schemas.AddMessageDto.properties).not.toHaveProperty('attachments');
    });
});
