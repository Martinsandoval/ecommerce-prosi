import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProductStatusFilter,
  type ProductsQueryParams,
} from '@ecommerce/shared';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export { ProductStatusFilter };

export class QueryProductsDto
  extends PaginationQueryDto
  implements ProductsQueryParams
{
  @ApiPropertyOptional({
    enum: ProductStatusFilter,
    default: ProductStatusFilter.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatusFilter)
  status?: ProductStatusFilter = ProductStatusFilter.ACTIVE;

  @ApiPropertyOptional({
    description: 'Case-insensitive search on product name',
  })
  @IsOptional()
  @Trim()
  @IsString()
  search?: string;
}
