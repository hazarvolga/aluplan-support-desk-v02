import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'Kullanıcı Adı zorunludur' })
  username: string; // Will map to User.fullName for simplicity, or we store separately. Let's use it for email prefix if needed or just metadata

  @IsString()
  @IsNotEmpty({ message: 'Ad zorunludur' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Soyad zorunludur' })
  lastName: string;

  @IsString()
  @IsOptional()
  customerNo?: string;

  @IsString()
  @IsNotEmpty({ message: 'Firma adı zorunludur' })
  company: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta zorunludur' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Şifreniz en az 6 karakter olmalıdır' })
  @IsNotEmpty({ message: 'Şifre zorunludur' })
  password: string;

  @IsString({ each: true })
  @IsOptional()
  usedProducts?: string[];

  @IsOptional()
  isAllplanUser?: boolean;
}
