import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAllProducts: jest.fn(),
            createProduct: jest.fn(),
            updateProduct: jest.fn(),
            archiveProduct: jest.fn(),
            getProduct: jest.fn(),
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates product updates to the service', async () => {
    const service = (controller as any).productsService as jest.Mocked<ProductsService>;
    service.updateProduct.mockResolvedValue({ id: 'product-id', name: 'ALLPLAN 2027' } as any);

    await expect(controller.update('product-id', { name: 'ALLPLAN 2027' })).resolves.toEqual({
      id: 'product-id',
      name: 'ALLPLAN 2027',
    });
    expect(service.updateProduct).toHaveBeenCalledWith('product-id', { name: 'ALLPLAN 2027' });
  });

  it('delegates product archive requests to the service', async () => {
    const service = (controller as any).productsService as jest.Mocked<ProductsService>;
    service.archiveProduct.mockResolvedValue({ id: 'product-id', isActive: false } as any);

    await expect(controller.remove('product-id')).resolves.toEqual({ id: 'product-id', isActive: false });
    expect(service.archiveProduct).toHaveBeenCalledWith('product-id');
  });
});
