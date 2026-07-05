import { PartialType } from '@nestjs/swagger';
import type { UpdateProductInput } from '@ecommerce/shared';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto
  extends PartialType(CreateProductDto)
  implements UpdateProductInput {}
