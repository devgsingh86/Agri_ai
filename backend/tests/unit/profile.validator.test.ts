import {
  createProfileSchema,
  patchProfileSchema,
  cropsQuerySchema,
  registerSchema,
} from '../../src/validators/profile.validator';

describe('createProfileSchema', () => {
  const validPayload = {
    first_name: 'John',
    last_name: 'Doe',
    farm_size: 10,
    farm_size_unit: 'hectares',
    location_type: 'manual',
    country: 'India',
    state: 'Punjab',
    experience_level: 'beginner',
    crops: [{ crop_name: 'Wheat', is_custom: false }],
  };

  it('validates a valid payload', () => {
    const { error } = createProfileSchema.validate(validPayload);
    expect(error).toBeUndefined();
  });

  it('requires first_name', () => {
    const { error } = createProfileSchema.validate({ ...validPayload, first_name: undefined });
    expect(error).toBeDefined();
    expect(error?.details[0].path).toContain('first_name');
  });

  it('requires at least 1 crop', () => {
    const { error } = createProfileSchema.validate({ ...validPayload, crops: [] });
    expect(error).toBeDefined();
  });

  it('rejects more than 5 crops', () => {
    const crops = Array.from({ length: 6 }, (_, i) => ({
      crop_name: `Crop ${i}`,
      is_custom: false,
    }));
    const { error } = createProfileSchema.validate({ ...validPayload, crops });
    expect(error).toBeDefined();
  });

  it('requires latitude when location_type is gps', () => {
    const { error } = createProfileSchema.validate({
      ...validPayload,
      location_type: 'gps',
      longitude: 75.8,
      // missing latitude
    });
    expect(error).toBeDefined();
  });

  it('allows latitude/longitude to be optional for manual location', () => {
    const { error } = createProfileSchema.validate({
      ...validPayload,
      location_type: 'manual',
    });
    expect(error).toBeUndefined();
  });

  it('rejects invalid experience_level', () => {
    const { error } = createProfileSchema.validate({
      ...validPayload,
      experience_level: 'super-expert',
    });
    expect(error).toBeDefined();
  });

  it('rejects negative farm_size', () => {
    const { error } = createProfileSchema.validate({ ...validPayload, farm_size: -1 });
    expect(error).toBeDefined();
  });
});

describe('patchProfileSchema', () => {
  it('accepts partial update with just first_name', () => {
    const { error } = patchProfileSchema.validate({ first_name: 'Jane' });
    expect(error).toBeUndefined();
  });

  it('rejects empty object (at least one field required)', () => {
    const { error } = patchProfileSchema.validate({});
    expect(error).toBeDefined();
  });
});

describe('cropsQuerySchema', () => {
  it('applies defaults for limit and offset', () => {
    const { value } = cropsQuerySchema.validate({});
    expect(value.limit).toBe(20);
    expect(value.offset).toBe(0);
  });

  it('validates custom limit and offset', () => {
    const { error, value } = cropsQuerySchema.validate({ limit: '50', offset: '10' });
    expect(error).toBeUndefined();
    expect(value.limit).toBe(50);
    expect(value.offset).toBe(10);
  });

  it('rejects limit > 100', () => {
    const { error } = cropsQuerySchema.validate({ limit: 200 });
    expect(error).toBeDefined();
  });
});

describe('registerSchema', () => {
  it('validates valid registration', () => {
    const { error } = registerSchema.validate({
      email: 'user@example.com',
      password: 'securepassword123',
    });
    expect(error).toBeUndefined();
  });

  it('rejects invalid email', () => {
    const { error } = registerSchema.validate({ email: 'not-an-email', password: 'password123' });
    expect(error).toBeDefined();
  });

  it('rejects password shorter than 8 characters', () => {
    const { error } = registerSchema.validate({ email: 'user@example.com', password: 'short' });
    expect(error).toBeDefined();
  });
});
