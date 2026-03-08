// Manual mock for react-native
// This avoids Flow type parsing issues in Jest

import React from 'react';

// Mock Components
export const View = ({ children, ...props }) => React.createElement('View', props, children);
export const Text = ({ children, ...props }) => React.createElement('Text', props, children);
export const Image = (props) => React.createElement('Image', props);
export const TextInput = (props) => React.createElement('TextInput', props);
export const ScrollView = ({ children, ...props }) => React.createElement('ScrollView', props, children);
export const TouchableOpacity = ({ children, onPress, ...props }) => 
  React.createElement('TouchableOpacity', { ...props, onPress }, children);
export const TouchableHighlight = ({ children, onPress, ...props }) => 
  React.createElement('TouchableHighlight', { ...props, onPress }, children);
export const TouchableWithoutFeedback = ({ children, onPress, ...props }) => 
  React.createElement('TouchableWithoutFeedback', { ...props, onPress }, children);
export const Pressable = ({ children, onPress, ...props }) => 
  React.createElement('Pressable', { ...props, onPress }, children);
export const FlatList = ({ data, renderItem, keyExtractor, ...props }) => 
  React.createElement('FlatList', { data, renderItem, keyExtractor, ...props });
export const SectionList = (props) => React.createElement('SectionList', props);
export const SafeAreaView = ({ children, ...props }) => 
  React.createElement('SafeAreaView', props, children);
export const ActivityIndicator = (props) => React.createElement('ActivityIndicator', props);
export const RefreshControl = (props) => React.createElement('RefreshControl', props);
export const Modal = ({ children, ...props }) => React.createElement('Modal', props, children);

// Mock APIs
export const Dimensions = {
  get: jest.fn().mockReturnValue({
    width: 375,
    height: 812,
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export const Platform = {
  OS: 'ios',
  Version: '14.0',
  select: jest.fn((obj) => obj.ios || obj.default),
};

export const Alert = {
  alert: jest.fn(),
};

export const Keyboard = {
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  dismiss: jest.fn(),
};

export const StatusBar = {
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setHidden: jest.fn(),
};

export const StyleSheet = {
  create: (styles) => styles,
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  flatten: jest.fn((style) => style),
};

export const PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
  roundToNearestPixel: jest.fn((size) => size),
};

export const AppState = {
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

export const Linking = {
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
};

export const Vibration = {
  vibrate: jest.fn(),
  cancel: jest.fn(),
};

// Mock hooks
export const useColorScheme = jest.fn(() => 'light');
export const useWindowDimensions = jest.fn(() => ({ width: 375, height: 812 }));

// Default export
export default {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  FlatList,
  SectionList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
  Platform,
  Alert,
  Keyboard,
  StatusBar,
  StyleSheet,
  PixelRatio,
  AppState,
  Linking,
  Vibration,
  useColorScheme,
  useWindowDimensions,
};
