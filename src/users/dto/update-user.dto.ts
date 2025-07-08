import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { CreateUserDto } from './create-user.dto';

const UpdateUserDtoBase: any = PartialType(CreateUserDto);

export class UpdateUserDto extends UpdateUserDtoBase {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value?.toLowerCase()?.trim() : value,
  )
  email?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User role',
    example: UserRole.USER,
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'User profile image URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;

  @ApiPropertyOptional({
    description: 'Whether user has course access',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Course access must be a boolean' })
  hasCourseAccess?: boolean;

  @ApiPropertyOptional({
    description: 'Whether user is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Last visited date',
    example: '2023-12-01T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Last visited must be a valid date' })
  lastVisited?: Date;

  @ApiPropertyOptional({
    description: 'Whether user has used trial',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Has used trial must be a boolean' })
  hasUsedTrial?: boolean;

  @ApiPropertyOptional({
    description: 'Whether user has used cancel flow coupon',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Has used cancel flow coupon must be a boolean' })
  hasUsedCancelFlowCoupon?: boolean;
}
