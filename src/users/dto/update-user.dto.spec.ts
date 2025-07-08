import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToClass(UpdateUserDto, {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid email', async () => {
    const dto = plainToClass(UpdateUserDto, {
      email: 'invalid-email',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isEmail');
    expect(errors[0].constraints.isEmail).toBe(
      'Please provide a valid email address',
    );
  });

  it('should fail validation with short firstName', async () => {
    const dto = plainToClass(UpdateUserDto, {
      firstName: 'J',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('minLength');
    expect(errors[0].constraints.minLength).toBe(
      'First name must be at least 2 characters long',
    );
  });

  it('should fail validation with non-string firstName', async () => {
    const dto = plainToClass(UpdateUserDto, {
      firstName: 123,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isString');
    expect(errors[0].constraints.isString).toBe('First name must be a string');
  });

  it('should fail validation with short lastName', async () => {
    const dto = plainToClass(UpdateUserDto, {
      lastName: 'D',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('minLength');
    expect(errors[0].constraints.minLength).toBe(
      'Last name must be at least 2 characters long',
    );
  });

  it('should fail validation with non-string lastName', async () => {
    const dto = plainToClass(UpdateUserDto, {
      lastName: 123,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isString');
    expect(errors[0].constraints.isString).toBe('Last name must be a string');
  });

  it('should fail validation with invalid role', async () => {
    const dto = plainToClass(UpdateUserDto, {
      role: 'INVALID_ROLE',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isEnum');
    expect(errors[0].constraints.isEnum).toBe('Role must be a valid user role');
  });

  it('should fail validation with invalid image URL', async () => {
    const dto = plainToClass(UpdateUserDto, {
      image: 'invalid-url',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isUrl');
    expect(errors[0].constraints.isUrl).toBe('Image must be a valid URL');
  });

  it('should fail validation with non-boolean hasCourseAccess', async () => {
    const dto = plainToClass(UpdateUserDto, {
      hasCourseAccess: 'true',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isBoolean');
    expect(errors[0].constraints.isBoolean).toBe(
      'Course access must be a boolean',
    );
  });

  it('should fail validation with non-boolean isActive', async () => {
    const dto = plainToClass(UpdateUserDto, {
      isActive: 'false',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isBoolean');
    expect(errors[0].constraints.isBoolean).toBe(
      'Active status must be a boolean',
    );
  });

  it('should fail validation with invalid lastVisited date', async () => {
    const dto = plainToClass(UpdateUserDto, {
      lastVisited: 'invalid-date',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isDateString');
    expect(errors[0].constraints.isDateString).toBe(
      'Last visited must be a valid date',
    );
  });

  it('should fail validation with non-boolean hasUsedTrial', async () => {
    const dto = plainToClass(UpdateUserDto, {
      hasUsedTrial: 'true',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isBoolean');
    expect(errors[0].constraints.isBoolean).toBe(
      'Has used trial must be a boolean',
    );
  });

  it('should fail validation with non-boolean hasUsedCancelFlowCoupon', async () => {
    const dto = plainToClass(UpdateUserDto, {
      hasUsedCancelFlowCoupon: 'false',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isBoolean');
    expect(errors[0].constraints.isBoolean).toBe(
      'Has used cancel flow coupon must be a boolean',
    );
  });

  it('should transform email to lowercase and trim', async () => {
    const dto = plainToClass(UpdateUserDto, {
      email: '  TEST@EXAMPLE.COM  ',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('test@example.com');
  });

  it('should transform firstName to trim', async () => {
    const dto = plainToClass(UpdateUserDto, {
      firstName: '  John  ',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.firstName).toBe('John');
  });

  it('should transform lastName to trim', async () => {
    const dto = plainToClass(UpdateUserDto, {
      lastName: '  Doe  ',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.lastName).toBe('Doe');
  });
});
