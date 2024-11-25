import { Route, Switch } from "wouter";
import styles from "./dashboard.module.css";
import Sidebar from "./navigation/sidebar";
import Topbar from "./navigation/topbar";
import DashboardHome from "./home/home";
import ErrorPage from "../main/error/error";

function Dashboard() {
   return (
      <>
         <div className={styles.dashboard}>
            <Sidebar />
            <div className={styles.dashboardContainer}>
               <Topbar />
               <div className={styles.dashboardContent}>
                  <Switch>
                     <Route path={"/"} component={DashboardHome} />
                     <Route>
                        <ErrorPage style={{ margin: "0 0 1rem 0" }} />
                     </Route>
                  </Switch>
               </div>
            </div>
         </div>
      </>
   );
}

export default Dashboard;
