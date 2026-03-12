import { calculateSM2 } from '../database';

/**
 * SM-2 Spaced Repetition Algorithm Tests
 *
 * Covers:
 * - SC-2.2: All quality/status transitions
 * - SC-2.3: Ease factor floor enforcement
 * - SC-2.7: Interval overflow after many reviews
 * - Edge cases: invalid input, defaults, borderline quality
 * - Full progression: new -> learning -> consolidating -> mastered
 * - Relapse simulation: quality < 3 resets repetitions
 */

describe('calculateSM2', () => {
  // ---------------------------------------------------------------------------
  // SC-2.2 -- Quality / status transitions
  // ---------------------------------------------------------------------------
  describe('SC-2.2: quality and status transitions', () => {
    it('quality=5 with rep=0 sets interval=1 and increments rep to 1 (learning)', () => {
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 0, repetitions: 0 },
        5,
      );

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      // EF = 2.5 + (0.1 - 0*(0.08 + 0*0.02)) = 2.6
      expect(result.ease_factor).toBeCloseTo(2.6, 5);
    });

    it('quality=5 with rep=1 sets interval=6 and increments rep to 2 (consolidating)', () => {
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 1, repetitions: 1 },
        5,
      );

      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
      expect(result.ease_factor).toBeCloseTo(2.6, 5);
    });

    it('quality=5 with rep=4 computes interval=round(prev*EF) and increments rep to 5 (mastered)', () => {
      const prevInterval = 15;
      const ef = 2.5;
      const result = calculateSM2(
        { ease_factor: ef, interval: prevInterval, repetitions: 4 },
        5,
      );

      // EF after: 2.5 + (0.1 - 0*(0.08 + 0*0.02)) = 2.6
      // interval = round(15 * 2.5) = round(37.5) = 38
      expect(result.interval).toBe(Math.round(prevInterval * ef));
      expect(result.repetitions).toBe(5);
      expect(result.ease_factor).toBeCloseTo(2.6, 5);
    });

    it('quality=3 with rep=0 sets interval=1 and increments rep to 1', () => {
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 0, repetitions: 0 },
        3,
      );

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      // EF = 2.5 + (0.1 - 2*(0.08 + 2*0.02)) = 2.5 + (0.1 - 2*0.12)
      //    = 2.5 + (0.1 - 0.24) = 2.5 - 0.14 = 2.36
      expect(result.ease_factor).toBeCloseTo(2.36, 5);
    });

    it('quality=1 with rep=4 resets rep to 0 and interval to 1', () => {
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 15, repetitions: 4 },
        1,
      );

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      // EF = 2.5 + (0.1 - 4*(0.08 + 4*0.02)) = 2.5 + (0.1 - 4*0.16)
      //    = 2.5 + (0.1 - 0.64) = 2.5 - 0.54 = 1.96
      expect(result.ease_factor).toBeCloseTo(1.96, 5);
    });

    it('quality=0 with rep=10 resets rep to 0 and interval to 1', () => {
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 100, repetitions: 10 },
        0,
      );

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      // EF = 2.5 + (0.1 - 5*(0.08 + 5*0.02)) = 2.5 + (0.1 - 5*0.18)
      //    = 2.5 + (0.1 - 0.9) = 2.5 - 0.8 = 1.7
      expect(result.ease_factor).toBeCloseTo(1.7, 5);
    });
  });

  // ---------------------------------------------------------------------------
  // SC-2.3 -- Ease factor floor
  // ---------------------------------------------------------------------------
  describe('SC-2.3: ease factor floor at 1.3', () => {
    it('10 consecutive quality=0 reviews never drop EF below 1.3', () => {
      let ef = 2.5;
      let interval = 0;
      let rep = 0;

      for (let i = 0; i < 10; i++) {
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          0,
        );

        expect(result.ease_factor).toBeGreaterThanOrEqual(1.3);

        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;
      }

      // After 10 rounds of quality=0, EF should be clamped at exactly 1.3
      expect(ef).toBeCloseTo(1.3, 5);
    });

    it('EF never goes below 1.3 even with alternating quality=0 and quality=1', () => {
      let ef = 2.5;
      let interval = 0;
      let rep = 0;

      for (let i = 0; i < 20; i++) {
        const quality = (i % 2 === 0 ? 0 : 1) as 0 | 1;
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          quality,
        );

        expect(result.ease_factor).toBeGreaterThanOrEqual(1.3);

        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;
      }
    });

    it('EF at exactly 1.3 stays at 1.3 with quality=0', () => {
      const result = calculateSM2(
        { ease_factor: 1.3, interval: 1, repetitions: 0 },
        0,
      );

      // EF = 1.3 + (0.1 - 5*(0.08 + 5*0.02)) = 1.3 - 0.8 = 0.5 -> clamped to 1.3
      expect(result.ease_factor).toBe(1.3);
    });
  });

  // ---------------------------------------------------------------------------
  // SC-2.7 -- Interval overflow after many reviews
  // ---------------------------------------------------------------------------
  describe('SC-2.7: interval growth after many successful reviews', () => {
    it('20 consecutive quality=5 reviews produce a large but finite interval', () => {
      let ef = 2.5;
      let interval = 0;
      let rep = 0;

      for (let i = 0; i < 20; i++) {
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          5,
        );

        expect(Number.isFinite(result.interval)).toBe(true);
        expect(result.interval).toBeGreaterThan(0);

        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;
      }

      // After 20 quality=5 reviews, interval should be very large (months/years)
      // but still a finite number
      expect(interval).toBeGreaterThan(1000);
      expect(Number.isFinite(interval)).toBe(true);
      expect(rep).toBe(20);
    });

    it('interval grows monotonically with consistent quality=5', () => {
      let ef = 2.5;
      let interval = 0;
      let rep = 0;
      let previousInterval = -1;

      for (let i = 0; i < 15; i++) {
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          5,
        );

        // After the first two reviews (which use fixed intervals 1 and 6),
        // each subsequent interval should be strictly larger than the previous
        if (i >= 2) {
          expect(result.interval).toBeGreaterThan(previousInterval);
        }

        previousInterval = result.interval;
        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('throws on quality=6', () => {
      expect(() =>
        calculateSM2({ ease_factor: 2.5, interval: 0, repetitions: 0 }, 6 as any),
      ).toThrow('Invalid quality score: 6');
    });

    it('throws on quality=-1', () => {
      expect(() =>
        calculateSM2({ ease_factor: 2.5, interval: 0, repetitions: 0 }, -1 as any),
      ).toThrow('Invalid quality score: -1');
    });

    it('throws on quality=100', () => {
      expect(() =>
        calculateSM2({ ease_factor: 2.5, interval: 0, repetitions: 0 }, 100 as any),
      ).toThrow('Invalid quality score: 100');
    });

    it('uses default values when verse object is empty', () => {
      const result = calculateSM2({}, 4);

      // Defaults: EF=2.5, interval=0, rep=0
      // quality=4 >= 3, rep=0 -> interval=1, rep=1
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      // EF = 2.5 + (0.1 - 1*(0.08 + 1*0.02)) = 2.5 + (0.1 - 0.1) = 2.5
      expect(result.ease_factor).toBeCloseTo(2.5, 5);
    });

    it('uses default values when properties are undefined', () => {
      const result = calculateSM2(
        { ease_factor: undefined, interval: undefined, repetitions: undefined },
        5,
      );

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      expect(result.ease_factor).toBeCloseTo(2.6, 5);
    });

    it('quality=3 borderline pass computes correct EF adjustment', () => {
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 6, repetitions: 1 },
        3,
      );

      // quality=3 >= 3, rep=1 -> interval=6, rep=2
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
      // EF = 2.5 + (0.1 - 2*(0.08 + 2*0.02)) = 2.5 + (0.1 - 0.24) = 2.36
      expect(result.ease_factor).toBeCloseTo(2.36, 5);
    });

    it('quality=2 borderline fail resets repetitions and interval', () => {
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 30, repetitions: 5 },
        2,
      );

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      // EF = 2.5 + (0.1 - 3*(0.08 + 3*0.02)) = 2.5 + (0.1 - 3*0.14)
      //    = 2.5 + (0.1 - 0.42) = 2.5 - 0.32 = 2.18
      expect(result.ease_factor).toBeCloseTo(2.18, 5);
    });
  });

  // ---------------------------------------------------------------------------
  // EF calculation accuracy for each quality level
  // ---------------------------------------------------------------------------
  describe('ease factor formula accuracy', () => {
    const baseCases: { quality: 0 | 1 | 2 | 3 | 4 | 5; expectedDelta: number }[] = [
      // EF_delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
      { quality: 0, expectedDelta: 0.1 - 5 * (0.08 + 5 * 0.02) },   // -0.8
      { quality: 1, expectedDelta: 0.1 - 4 * (0.08 + 4 * 0.02) },   // -0.54
      { quality: 2, expectedDelta: 0.1 - 3 * (0.08 + 3 * 0.02) },   // -0.32
      { quality: 3, expectedDelta: 0.1 - 2 * (0.08 + 2 * 0.02) },   // -0.14
      { quality: 4, expectedDelta: 0.1 - 1 * (0.08 + 1 * 0.02) },   // 0.0
      { quality: 5, expectedDelta: 0.1 - 0 * (0.08 + 0 * 0.02) },   // 0.1
    ];

    it.each(baseCases)(
      'quality=$quality applies correct EF delta of $expectedDelta',
      ({ quality, expectedDelta }) => {
        const baseEF = 2.5;
        const result = calculateSM2(
          { ease_factor: baseEF, interval: 1, repetitions: 0 },
          quality,
        );

        const expectedEF = Math.max(1.3, baseEF + expectedDelta);
        expect(result.ease_factor).toBeCloseTo(expectedEF, 5);
      },
    );
  });

  // ---------------------------------------------------------------------------
  // Full progression: new -> learning -> consolidating -> mastered
  // ---------------------------------------------------------------------------
  describe('full progression simulation', () => {
    it('progresses a verse from new to mastered with consistent quality=4', () => {
      let ef = 2.5;
      let interval = 0;
      let rep = 0;

      // Review 1: rep 0 -> 1 (learning), interval = 1
      let result = calculateSM2({ ease_factor: ef, interval, repetitions: rep }, 4);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      ef = result.ease_factor;
      interval = result.interval;
      rep = result.repetitions;

      // Review 2: rep 1 -> 2 (consolidating), interval = 6
      result = calculateSM2({ ease_factor: ef, interval, repetitions: rep }, 4);
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
      ef = result.ease_factor;
      interval = result.interval;
      rep = result.repetitions;

      // Review 3: rep 2 -> 3, interval = round(6 * EF)
      result = calculateSM2({ ease_factor: ef, interval, repetitions: rep }, 4);
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(Math.round(6 * ef));
      ef = result.ease_factor;
      interval = result.interval;
      rep = result.repetitions;

      // Review 4: rep 3 -> 4, interval = round(prev * EF)
      const prevInterval4 = interval;
      result = calculateSM2({ ease_factor: ef, interval, repetitions: rep }, 4);
      expect(result.repetitions).toBe(4);
      expect(result.interval).toBe(Math.round(prevInterval4 * ef));
      ef = result.ease_factor;
      interval = result.interval;
      rep = result.repetitions;

      // Review 5: rep 4 -> 5 (mastered threshold), interval = round(prev * EF)
      const prevInterval5 = interval;
      result = calculateSM2({ ease_factor: ef, interval, repetitions: rep }, 4);
      expect(result.repetitions).toBe(5);
      expect(result.interval).toBe(Math.round(prevInterval5 * ef));

      // Verify EF stayed at 2.5 throughout (quality=4 has zero delta)
      expect(result.ease_factor).toBeCloseTo(2.5, 5);
    });

    it('progresses with mixed quality scores (4, 5, 3, 4, 5) to mastered', () => {
      const qualities: (3 | 4 | 5)[] = [4, 5, 3, 4, 5];
      let ef = 2.5;
      let interval = 0;
      let rep = 0;

      for (const q of qualities) {
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          q,
        );

        // All quality >= 3, so rep should increment each time
        expect(result.repetitions).toBe(rep + 1);

        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;
      }

      // After 5 successful reviews, should be at mastered threshold
      expect(rep).toBe(5);
      expect(interval).toBeGreaterThan(6);
      expect(ef).toBeGreaterThanOrEqual(1.3);
    });
  });

  // ---------------------------------------------------------------------------
  // Relapse simulation: quality < 3 resets progress
  // ---------------------------------------------------------------------------
  describe('relapse simulation', () => {
    it('resets a consolidated verse back to start on quality < 3', () => {
      // Build up to rep=4 with quality=5
      let ef = 2.5;
      let interval = 0;
      let rep = 0;

      for (let i = 0; i < 4; i++) {
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          5,
        );
        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;
      }

      expect(rep).toBe(4);
      expect(interval).toBeGreaterThan(6);
      const intervalBeforeRelapse = interval;
      const efBeforeRelapse = ef;

      // Relapse with quality=2
      const relapse = calculateSM2(
        { ease_factor: ef, interval, repetitions: rep },
        2,
      );

      expect(relapse.repetitions).toBe(0);
      expect(relapse.interval).toBe(1);
      // EF should decrease but remain >= 1.3
      expect(relapse.ease_factor).toBeLessThan(efBeforeRelapse);
      expect(relapse.ease_factor).toBeGreaterThanOrEqual(1.3);

      // Verify the interval dropped significantly
      expect(relapse.interval).toBeLessThan(intervalBeforeRelapse);
    });

    it('can recover from relapse and progress again to mastered', () => {
      // Build up to rep=3
      let ef = 2.5;
      let interval = 0;
      let rep = 0;

      for (let i = 0; i < 3; i++) {
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          5,
        );
        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;
      }

      expect(rep).toBe(3);

      // Relapse with quality=1
      const relapse = calculateSM2(
        { ease_factor: ef, interval, repetitions: rep },
        1,
      );
      ef = relapse.ease_factor;
      interval = relapse.interval;
      rep = relapse.repetitions;

      expect(rep).toBe(0);
      expect(interval).toBe(1);

      // Recover: 5 more quality=5 reviews to reach mastered again
      for (let i = 0; i < 5; i++) {
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          5,
        );
        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;
      }

      expect(rep).toBe(5);
      expect(interval).toBeGreaterThan(1);
      expect(ef).toBeGreaterThanOrEqual(1.3);
    });

    it('multiple relapses keep EF above floor', () => {
      let ef = 2.5;
      let interval = 0;
      let rep = 0;

      // Cycle: build up 2 reps, then relapse. Repeat 5 times.
      for (let cycle = 0; cycle < 5; cycle++) {
        // Build up
        for (let i = 0; i < 2; i++) {
          const result = calculateSM2(
            { ease_factor: ef, interval, repetitions: rep },
            4,
          );
          ef = result.ease_factor;
          interval = result.interval;
          rep = result.repetitions;
        }

        // Relapse
        const result = calculateSM2(
          { ease_factor: ef, interval, repetitions: rep },
          0,
        );
        ef = result.ease_factor;
        interval = result.interval;
        rep = result.repetitions;

        expect(rep).toBe(0);
        expect(interval).toBe(1);
        expect(ef).toBeGreaterThanOrEqual(1.3);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Interval calculation specifics
  // ---------------------------------------------------------------------------
  describe('interval calculation details', () => {
    it('rep >= 2 uses round(interval * EF) for the interval', () => {
      const ef = 2.3;
      const interval = 10;
      const result = calculateSM2(
        { ease_factor: ef, interval, repetitions: 2 },
        4,
      );

      expect(result.interval).toBe(Math.round(10 * 2.3)); // 23
      expect(result.repetitions).toBe(3);
    });

    it('rounding works correctly for .5 boundary', () => {
      // Math.round(0.5) = 1 in JavaScript
      // With EF = 2.5 and interval = 3, result = 7.5 -> round to 8
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 3, repetitions: 2 },
        4,
      );

      expect(result.interval).toBe(Math.round(3 * 2.5)); // 8
    });

    it('quality < 3 always sets interval to 1 regardless of previous interval', () => {
      const intervals = [0, 1, 6, 30, 100, 1000];
      for (const prevInterval of intervals) {
        const result = calculateSM2(
          { ease_factor: 2.5, interval: prevInterval, repetitions: 3 },
          2,
        );
        expect(result.interval).toBe(1);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Return value structure
  // ---------------------------------------------------------------------------
  describe('return value structure', () => {
    it('returns an object with exactly ease_factor, interval, and repetitions', () => {
      const result = calculateSM2(
        { ease_factor: 2.5, interval: 0, repetitions: 0 },
        4,
      );

      expect(result).toHaveProperty('ease_factor');
      expect(result).toHaveProperty('interval');
      expect(result).toHaveProperty('repetitions');
      expect(typeof result.ease_factor).toBe('number');
      expect(typeof result.interval).toBe('number');
      expect(typeof result.repetitions).toBe('number');
    });

    it('does not mutate the input verse object', () => {
      const verse = { ease_factor: 2.5, interval: 6, repetitions: 3 };
      const original = { ...verse };

      calculateSM2(verse, 5);

      expect(verse.ease_factor).toBe(original.ease_factor);
      expect(verse.interval).toBe(original.interval);
      expect(verse.repetitions).toBe(original.repetitions);
    });
  });
});
