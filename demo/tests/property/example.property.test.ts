import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

describe('Property-Based Testing Setup', () => {
  it('should run property tests with fast-check', () => {
    // Simple property test to verify fast-check is working
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        (a, b) => {
          return a + b === b + a // Commutative property of addition
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should verify array reverse is involutive', () => {
    // Property: reversing an array twice returns the original array
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        (arr) => {
          const reversed = [...arr].reverse()
          const doubleReversed = [...reversed].reverse()
          expect(doubleReversed).toEqual(arr)
        }
      ),
      { numRuns: 100 }
    )
  })
})
