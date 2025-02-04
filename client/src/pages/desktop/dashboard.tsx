import { Route, Switch } from "wouter";
import styles from "./dashboard.module.css";
import Sidebar from "./navigation/sidebar";
import Topbar from "./navigation/topbar";
import DashboardHome from "./home/home";
import ErrorPage from "../main/error/error";
import SchedulePage from "./schedule/schedule";
import PicklistPage from "./picklists/picklists";

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
                     <Route>
                        <ErrorPage
                           style={{ margin: "0.75rem 0 1rem 0" }}
                        />
                     </Route>
                  </Switch>
               </div>
            </div>
         </div>
      </>
   );
}

export default Dashboard;
