import { acresToHectares, hectaresToAcres, normaliseToHectares, ACRES_TO_HECTARES } from '../../src/utils/conversion';

describe('Unit Conversion Utilities', () => {
  describe('acresToHectares', () => {
    it('converts 1 acre to ~0.404686 hectares', () => {
      expect(acresToHectares(1)).toBeCloseTo(0.404686, 4);
    });

    it('converts 0 acres to 0 hectares', () => {
      expect(acresToHectares(0)).toBe(0);
    });

    it('converts 10 acres to ~4.04686 hectares', () => {
      expect(acresToHectares(10)).toBeCloseTo(4.04686, 4);
    });

    it('converts 100 acres to ~40.4686 hectares', () => {
      expect(acresToHectares(100)).toBeCloseTo(40.4686, 3);
    });

    it('handles fractional acres', () => {
      expect(acresToHectares(0.5)).toBeCloseTo(0.202343, 4);
    });
  });

  describe('hectaresToAcres', () => {
    it('converts 1 hectare to ~2.47105 acres', () => {
      expect(hectaresToAcres(1)).toBeCloseTo(2.47105, 3);
    });

    it('converts 0 hectares to 0 acres', () => {
      expect(hectaresToAcres(0)).toBe(0);
    });

    it('is the inverse of acresToHectares', () => {
      const original = 5;
      const converted = hectaresToAcres(acresToHectares(original));
      expect(converted).toBeCloseTo(original, 3);
    });
  });

  describe('normaliseToHectares', () => {
    it('returns unchanged value when unit is hectares', () => {
      expect(normaliseToHectares(5, 'hectares')).toBe(5);
    });

    it('converts to hectares when unit is acres', () => {
      expect(normaliseToHectares(1, 'acres')).toBeCloseTo(ACRES_TO_HECTARES, 4);
    });

    it('converts 10 acres to ~4.04686 hectares', () => {
      expect(normaliseToHectares(10, 'acres')).toBeCloseTo(4.04686, 4);
    });
  });

  describe('ACRES_TO_HECTARES constant', () => {
    it('equals 0.404686', () => {
      expect(ACRES_TO_HECTARES).toBe(0.404686);
    });
  });
});
