import { calculateCompleteness, ProfileService, CreateProfileInput } from '../../src/services/profile.service';
import { ProfileRepository } from '../../src/repositories/profile.repository';
import { AppError } from '../../src/middleware/error.middleware';

// Mock the repository
jest.mock('../../src/repositories/profile.repository');
// Mock uuid to get predictable IDs
jest.mock('uuid', () => ({ v4: () => 'test-uuid-1234' }));

const MockedRepo = ProfileRepository as jest.MockedClass<typeof ProfileRepository>;

describe('calculateCompleteness', () => {
  it('returns 50 for minimal required fields only', () => {
    const input: Partial<CreateProfileInput> = {
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
    expect(calculateCompleteness(input)).toBe(50);
  });

  it('returns 60 when phone_number is provided', () => {
    const input: Partial<CreateProfileInput> = {
      phone_number: '+919876543210',
    };
    expect(calculateCompleteness(input)).toBe(60);
  });

  it('returns 100 when all optional fields are provided', () => {
    const input: Partial<CreateProfileInput> = {
      phone_number: '+919876543210',
      village: 'Ludhiana',
      address: '123 Farm Road',
      years_of_experience: 5,
      latitude: 30.9,
      longitude: 75.8,
    };
    expect(calculateCompleteness(input)).toBe(100);
  });

  it('does not exceed 100', () => {
    const input: Partial<CreateProfileInput> = {
      phone_number: '+1',
      village: 'A',
      address: 'B',
      years_of_experience: 1,
      latitude: 0,
    };
    expect(calculateCompleteness(input)).toBeLessThanOrEqual(100);
  });
});

describe('ProfileService', () => {
  let service: ProfileService;
  let mockRepo: jest.Mocked<ProfileRepository>;

  const mockInput: CreateProfileInput = {
    first_name: 'John',
    last_name: 'Doe',
    farm_size: 5,
    farm_size_unit: 'acres',
    location_type: 'manual',
    country: 'India',
    state: 'Punjab',
    experience_level: 'beginner',
    crops: [{ crop_name: 'Wheat', is_custom: false }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = new MockedRepo() as jest.Mocked<ProfileRepository>;
    service = new ProfileService(mockRepo);
  });

  describe('createProfile', () => {
    it('throws 409 if profile already exists', async () => {
      mockRepo.findByUserId.mockResolvedValue({ id: 'existing', crops: [] } as any);

      await expect(service.createProfile('user-1', mockInput)).rejects.toThrow(AppError);
      await expect(service.createProfile('user-1', mockInput)).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it('creates profile successfully when no existing profile', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      const createdProfile = { id: 'test-uuid-1234', ...mockInput, crops: [] };
      mockRepo.transaction.mockImplementation(async (cb) => {
        mockRepo.createInTransaction.mockResolvedValue(createdProfile as any);
        mockRepo.deleteOnboardingProgress.mockResolvedValue(undefined);
        return cb({ } as any);
      });
      mockRepo.createInTransaction.mockResolvedValue(createdProfile as any);

      const result = await service.createProfile('user-1', mockInput);
      expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1');
      expect(mockRepo.transaction).toHaveBeenCalled();
    });

    it('converts acres to hectares correctly', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      let capturedProfileData: any;
      mockRepo.transaction.mockImplementation(async (cb) => {
        mockRepo.createInTransaction.mockImplementation(async (_trx, profileData) => {
          capturedProfileData = profileData;
          return { ...profileData, crops: [] } as any;
        });
        mockRepo.deleteOnboardingProgress.mockResolvedValue(undefined);
        return cb({} as any);
      });

      await service.createProfile('user-1', { ...mockInput, farm_size: 1, farm_size_unit: 'acres' });
      expect(capturedProfileData?.farm_size_hectares).toBeCloseTo(0.404686, 4);
    });
  });

  describe('getProfile', () => {
    it('throws 404 if no profile exists', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      await expect(service.getProfile('user-1')).rejects.toThrow(AppError);
      await expect(service.getProfile('user-1')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('returns profile when found', async () => {
      const profile = { id: 'profile-1', user_id: 'user-1', crops: [] } as any;
      mockRepo.findByUserId.mockResolvedValue(profile);
      const result = await service.getProfile('user-1');
      expect(result).toEqual(profile);
    });
  });

  describe('deleteProfile', () => {
    it('throws 404 if profile not found', async () => {
      mockRepo.softDelete.mockResolvedValue(false);
      await expect(service.deleteProfile('user-1')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('soft deletes successfully', async () => {
      mockRepo.softDelete.mockResolvedValue(true);
      await expect(service.deleteProfile('user-1')).resolves.toBeUndefined();
    });
  });
});
