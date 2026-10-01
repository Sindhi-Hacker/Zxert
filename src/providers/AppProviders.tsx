import 'react-native-url-polyfill/auto';
import React,{createContext,useContext,useEffect} from 'react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {useColorScheme} from 'react-native';
import {darkTheme,lightTheme,type AppTheme} from '@/theme/tokens';
import {useAppStore} from '@/store/appStore';
const ThemeContext=createContext(lightTheme);export const useTheme=()=>useContext(ThemeContext);
const client=new QueryClient({defaultOptions:{queries:{staleTime:60_000,retry:1}}});
export function AppProviders({children}:{children:React.ReactNode}){const system=useColorScheme();const {settings,hydrate}=useAppStore();useEffect(()=>{void hydrate();},[hydrate]);const dark=settings.theme==='dark'||(settings.theme==='system'&&system==='dark');const theme:AppTheme=dark?darkTheme:lightTheme;return <QueryClientProvider client={client}><ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider></QueryClientProvider>}
