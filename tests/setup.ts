jest.mock('expo-secure-store',()=>({WHEN_UNLOCKED_THIS_DEVICE_ONLY:'device',setItemAsync:jest.fn(),getItemAsync:jest.fn(),deleteItemAsync:jest.fn()}));
