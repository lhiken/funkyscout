import { useLocation } from "wouter";
import { logout } from "../../lib/supabase/auth";
import throwNotification from "../../components/toast/toast";
import supabase from "../../lib/supabase/supabase";

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

   async function testEventListRead() {
      const { data: event_list, error } = await supabase
         .from("event_list")
         .select("*");

      if (error) {
         console.log(error)
      }

      console.log(event_list);
   }

   async function testEventDataRead() {
      const { data: event_match_data, error } = await supabase
         .from("event_match_data")
         .select("*");

      if (error) {
         console.log(error)
      }

      console.log(event_match_data);
   }

   async function testEventScheduleRead() {
      const { data: event_schedule, error } = await supabase
      .from('event_schedule')
      .select('*')
    

      if (error) {
         console.log(error)
      }

      console.log(event_schedule);
   }

   return (
      <>
         <div style={{display: "flex", flexDirection: "column"}}>

         <button onClick={handleLogout}>
            logout
         </button>
         <button onClick={testEventDataRead}>
            read event data
         </button>
         <button onClick={testEventListRead}>
            read event list
         </button>
         <button onClick={testEventScheduleRead}>
            read event schedule
         </button>
         <button
            onClick={() => setLocation("/events/new")}
         >
            change events
         </button>
         {localStorage.getItem("event")}
         </div>
      </>
   );
}

export default Dashboard;
