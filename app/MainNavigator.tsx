
import Network from "@/pages/NetworkScreen";
import VerificationScreen from "@/pages/VerificationScreen";
import Webview from "@/pages/Webview";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


const MainStack = createNativeStackNavigator();
export default function MainNavigator() {


  return (
      <MainStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={"Webview"}>
        <MainStack.Screen name="VerificationScreen" component={VerificationScreen} />
        <MainStack.Screen name="Webview" component={Webview} />
        <MainStack.Screen name="Network" component={Network} />
      </MainStack.Navigator>
  )
}


