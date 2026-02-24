import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: {
            registerCustomer: jest.fn(),
            getAllCustomers: jest.fn(),
            importCustomers: jest.fn(),
            uploadHotinfo: jest.fn(),
            getCustomerById: jest.fn(),
            updateCustomer: jest.fn(),
            bulkDelete: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
