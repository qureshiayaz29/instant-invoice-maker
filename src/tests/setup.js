import '@testing-library/jest-dom';

// Mock IndexedDB (used by imageStorage util)
const indexedDB = {
    open: vi.fn(() => ({
        result: {},
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
    })),
};
global.indexedDB = indexedDB;

// Mock idb-keyval
vi.mock('idb-keyval', () => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
}));

// Mock URL.createObjectURL / revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock window.print
global.print = vi.fn();
window.print = vi.fn();

// Mock window.alert
global.alert = vi.fn();
window.alert = vi.fn();

// Mock window.confirm
global.confirm = vi.fn(() => true);
window.confirm = vi.fn(() => true);

