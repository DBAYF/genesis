import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'react-native'
import { ThemeProvider } from './src/context/ThemeContext'
import { AuthProvider } from './src/context/AuthContext'
import { store, persistor } from './src/redux/store'
import { RootStackParamList } from './src/types/navigation'

// Screens
import SplashScreen from './src/screens/SplashScreen'
import LoginScreen from './src/screens/auth/LoginScreen'
import RegisterScreen from './src/screens/auth/RegisterScreen'
import BiometricSetupScreen from './src/screens/auth/BiometricSetupScreen'
import DashboardScreen from './src/screens/main/DashboardScreen'
import CompanyProfileScreen from './src/screens/company/CompanyProfileScreen'
import FinancialOverviewScreen from './src/screens/financial/FinancialOverviewScreen'
import ComplianceDashboardScreen from './src/screens/compliance/ComplianceDashboardScreen'
import InvestorNetworkScreen from './src/screens/nexus/InvestorNetworkScreen'
import CalendarScreen from './src/screens/calendar/CalendarScreen'
import SettingsScreen from './src/screens/settings/SettingsScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AuthProvider>
            <SafeAreaProvider>
              <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Splash"
                  screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                >
                  {/* Auth Flow */}
                  <Stack.Screen name="Splash" component={SplashScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />

                  {/* Main App */}
                  <Stack.Screen name="Dashboard" component={DashboardScreen} />
                  <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
                  <Stack.Screen name="FinancialOverview" component={FinancialOverviewScreen} />
                  <Stack.Screen name="ComplianceDashboard" component={ComplianceDashboardScreen} />
                  <Stack.Screen name="InvestorNetwork" component={InvestorNetworkScreen} />
                  <Stack.Screen name="Calendar" component={CalendarScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </SafeAreaProvider>
          </AuthProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
}

export default App