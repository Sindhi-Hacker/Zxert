/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('expo-secure-store',()=>({WHEN_UNLOCKED_THIS_DEVICE_ONLY:'device',setItemAsync:jest.fn(),getItemAsync:jest.fn(),deleteItemAsync:jest.fn()}));
jest.mock('@react-native-async-storage/async-storage',()=>require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-haptics',()=>({impactAsync:jest.fn(),notificationAsync:jest.fn(),ImpactFeedbackStyle:{Light:'light',Medium:'medium',Heavy:'heavy'},NotificationFeedbackType:{Success:'success',Warning:'warning',Error:'error'}}));
// Reanimated runs on the UI thread natively; use the shipped JS mocks in tests.
jest.mock('react-native-worklets',()=>require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated',()=>require('react-native-reanimated/mock'));
