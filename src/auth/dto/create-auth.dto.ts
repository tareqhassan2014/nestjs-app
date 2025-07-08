import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignUpUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least 1 uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least 1 lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Password must contain at least 1 number',
  })
  @Matches(/(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least 1 special character',
  })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
