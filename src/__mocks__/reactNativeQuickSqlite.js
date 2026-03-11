// Mock for react-native-quick-sqlite
const mockExecute = jest.fn(() => ({
  rows: [],
  insertId: 1,
}));

const mockDb = {
  execute: mockExecute,
  close: jest.fn(),
};

export const open = jest.fn(() => mockDb);
export default { open };
