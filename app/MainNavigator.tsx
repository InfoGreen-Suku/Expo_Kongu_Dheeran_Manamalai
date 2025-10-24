
import Network from "@/pages/NetworkScreen";
import VerificationScreen from "@/pages/VerificationScreen";
import Webview from "@/pages/Webview";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";


const MainStack = createNativeStackNavigator();
export default function MainNavigator() {


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#009333' }}>
      <MainStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={"Webview"}>
        <MainStack.Screen name="VerificationScreen" component={VerificationScreen} />
        <MainStack.Screen name="Webview" component={Webview} />
        <MainStack.Screen name="Network" component={Network} />
      </MainStack.Navigator>
    </SafeAreaView>
  )
}


