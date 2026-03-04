/**
 * StepNavigation — Back / Next button pair used at the bottom of each onboarding step.
 */
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface StepNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isLoading?: boolean;
  hideBack?: boolean;
}

export function StepNavigation({
  onBack,
  onNext,
  nextLabel = 'Next',
  isLoading = false,
  hideBack = false,
}: StepNavigationProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {!hideBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backLabel}>← Back</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.nextButton, isLoading && styles.nextButtonDisabled, hideBack && styles.nextButtonFull]}
        onPress={onNext}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={nextLabel}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.nextLabel}>{nextLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    minWidth: 90,
    alignItems: 'center',
  },
  backLabel: {
    fontSize: 16,
    color: '#555555',
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#2D7A3A',
    minWidth: 110,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#9AC99F',
  },
  nextLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
