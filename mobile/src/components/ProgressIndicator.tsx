/**
 * ProgressIndicator — shows "Step X of 5" with filled/empty dot track.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressIndicator({
  currentStep,
  totalSteps = 5,
}: ProgressIndicatorProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i + 1 < currentStep
                ? styles.dotCompleted
                : i + 1 === currentStep
                ? styles.dotActive
                : styles.dotPending,
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotCompleted: {
    backgroundColor: '#2D7A3A',
  },
  dotActive: {
    backgroundColor: '#4CAF50',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotPending: {
    backgroundColor: '#D0D0D0',
  },
  label: {
    fontSize: 13,
    color: '#6B6B6B',
    fontWeight: '500',
  },
});
