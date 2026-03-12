import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { haptic } from '../utils/haptic';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: 'welcome',
    icon: '📖',
    title: 'Bienvenue dans Al-Muallim',
    description: 'Votre compagnon pour la mémorisation du Quran avec la méthode espacée.',
  },
  {
    id: 'modes',
    icon: '🎯',
    title: '4 Modes de Récitation',
    description: 'Apprentissage, Test, Flow et Hifz pour mémoriser efficacement.',
  },
  {
    id: 'analysis',
    icon: '📚',
    title: 'Analyse Mot-à-Mot',
    description: 'Comprenez chaque mot avec racine, grammaire et traduction.',
  },
  {
    id: 'focus',
    icon: '🧘',
    title: 'Mode Focus',
    description: 'Sessions chronométrées pour une pratique concentrée.',
  },
  {
    id: 'goals',
    icon: '🏆',
    title: 'Objectifs & Récompenses',
    description: 'Gagnez des points et débloquez des achievements.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    haptic.light();
    if (currentSlide < slides.length - 1) {
      scrollViewRef.current?.scrollTo({ x: width * (currentSlide + 1), animated: true });
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    haptic.light();
    if (currentSlide > 0) {
      scrollViewRef.current?.scrollTo({ x: width * (currentSlide - 1), animated: true });
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = async () => {
    haptic.medium();
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    (navigation as any).replace('Tabs');
  };

  const handleGetStarted = async () => {
    haptic.success();
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    (navigation as any).replace('Tabs');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.primary }]}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <Text style={styles.icon}>{slide.icon}</Text>
            <Text style={[styles.title, { color: colors.text, fontSize: fonts.hero }]}>
              {slide.title}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary, fontSize: fonts.body }]}>
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentSlide ? colors.primary : colors.border,
                width: index === currentSlide ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {currentSlide > 0 ? (
          <TouchableOpacity style={styles.buttonSecondary} onPress={handlePrevious}>
            <Text style={[styles.buttonText, { color: colors.text }]}>Précédent</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonPlaceholder} />
        )}

        {currentSlide === slides.length - 1 ? (
          <TouchableOpacity
            style={[styles.buttonPrimary, { backgroundColor: colors.primary }]}
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonPrimaryText}>Commencer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.buttonPrimary, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.buttonPrimaryText}>Suivant</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  placeholder: {
    width: 60,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  buttonPlaceholder: {
    width: 100,
  },
  buttonSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
