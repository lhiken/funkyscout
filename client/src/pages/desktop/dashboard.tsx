import { useLocation } from "wouter";
import { logout } from "../../lib/supabase/auth";
import throwNotification from "../../components/toast/toast";

function Dashboard() {
   const [, setLocation] = useLocation();

   function handleLogout() {
      logout().then((res) => {
         if (res) {
            setLocation("/auth/");
         } else {
            throwNotification("error", "Error logging out");
         }
      });
   }

   return (
      <>
         <button onClick={handleLogout}>
            logout
         </button>
      </>
   );
}

export default Dashboard;
