import { Route, Switch } from "wouter";
import styles from "./dashboard.module.css";
import Sidebar from "./navigation/sidebar";
import Topbar from "./navigation/topbar";
import DashboardHome from "./home/home";
import SchedulePage from "./schedule/schedule";
import PicklistPage from "./picklists/picklists";
import AnalyticsPage from "./analysis/analysis";

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
                     <Route
                        path={"/schedule"}
                        component={SchedulePage}
                     />
                     <Route
                        path={"/picklist"}
                        component={PicklistPage}
                     />
                     <Route
                        path={"/analysis"}
                        component={AnalyticsPage}
                     />
                     {/* </Route> */}
                  </Switch>
               </div>
            </div>
         </div>
      </>
   );
}

export default Dashboard;
