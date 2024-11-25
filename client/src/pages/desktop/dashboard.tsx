import { Route } from "wouter";
import styles from './dashboard.module.css'
import Sidebar from "./navigation/sidebar";
import Topbar from "./navigation/topbar";
import DashboardHome from "./home/home";

function Dashboard() {

   return (
      <> 
         <div className={styles.dashboard}>
            <Sidebar/>
            <div className={styles.dashboardContainer}>
               <Topbar/>
               <Route path={"/"} component={DashboardHome}/>
            </div>
         </div>
      </>
   );
}

export default Dashboard;
