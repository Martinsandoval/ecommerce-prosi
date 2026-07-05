import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { QueryProductsDto } from '../dto/query-products.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import type {
  PaginatedResponse,
  ProductResponse,
} from '../interfaces/product-response.interface';
import { ProductsService } from '../services/products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products (defaults to active only)' })
  findAll(
    @Query() query: QueryProductsDto,
  ): Promise<PaginatedResponse<ProductResponse>> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponse> {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() dto: CreateProductDto): Promise<ProductResponse> {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Re-activate a product so it shows in the storefront',
  })
  activate(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponse> {
    return this.productsService.setActive(id, true);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate a product so it is hidden from the storefront',
  })
  deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponse> {
    return this.productsService.setActive(id, false);
  }
}
