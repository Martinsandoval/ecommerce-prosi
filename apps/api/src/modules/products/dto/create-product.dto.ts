import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  MAX_PRODUCT_ATTRIBUTES,
  MIN_PRODUCT_PRICE,
  PRODUCT_NAME_MAX_LENGTH,
  type CreateProductInput,
} from '@ecommerce/shared';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';
import { ProductAttributeDto } from './product-attribute.dto';

export class CreateProductDto implements CreateProductInput {
  @ApiProperty({
    example: 'Classic Cotton T-Shirt',
    maxLength: PRODUCT_NAME_MAX_LENGTH,
  })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PRODUCT_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ example: 'https://example.com/images/t-shirt.png' })
  @Trim()
  @IsUrl({}, { message: 'pictureUrl must be a valid URL' })
  pictureUrl!: string;

  @ApiProperty({ example: 19.99, minimum: MIN_PRODUCT_PRICE })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiPropertyOptional({
    type: [ProductAttributeDto],
    maxItems: MAX_PRODUCT_ATTRIBUTES,
    example: [
      { name: 'Color', value: 'Red' },
      { name: 'Size', value: 'M' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PRODUCT_ATTRIBUTES, {
    message: `attributes must contain at most ${MAX_PRODUCT_ATTRIBUTES} elements`,
  })
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];
}
