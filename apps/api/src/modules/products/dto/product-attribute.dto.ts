import { ApiProperty } from '@nestjs/swagger';
import {
  PRODUCT_ATTRIBUTE_NAME_MAX_LENGTH,
  PRODUCT_ATTRIBUTE_VALUE_MAX_LENGTH,
  type ProductAttributeInput,
} from '@ecommerce/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class ProductAttributeDto implements ProductAttributeInput {
  @ApiProperty({
    example: 'Color',
    maxLength: PRODUCT_ATTRIBUTE_NAME_MAX_LENGTH,
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PRODUCT_ATTRIBUTE_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({
    example: 'Red',
    maxLength: PRODUCT_ATTRIBUTE_VALUE_MAX_LENGTH,
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PRODUCT_ATTRIBUTE_VALUE_MAX_LENGTH)
  value!: string;
}
