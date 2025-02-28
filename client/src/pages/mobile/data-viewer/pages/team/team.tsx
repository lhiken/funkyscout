import { useParams } from "wouter";
import styles from "./team.module.css";
import { getEvent, parseTeamKey } from "../../../../../utils/logic/app";
import { createContext, useContext, useEffect, useState } from "react";
import { GlobalTeamDataContext } from "../../../../../app-global-ctx";
import {
   fetchSpecificTeamDataByEvent,
   fetchTeamImage,
} from "../../../../../lib/supabase/data";
import { Tables } from "../../../../../lib/supabase/database.types";
import { PitData2025 } from "../../../../../schemas/defs";

const TeamDataContext = createContext<Tables<"event_team_data"> | undefined>(
   undefined,
);

export default function TeamDataViewer() {
   const params = useParams();
   const teamKey = params["team"] || "N/A";

   const globData = useContext(GlobalTeamDataContext);
   const [teamData, setTeamData] = useState<Tables<"event_team_data">>();

   useEffect(() => {
      fetchSpecificTeamDataByEvent(teamKey, getEvent() || "").then((res) => {
         setTeamData(res);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <TeamDataContext.Provider value={teamData}>
         <div className={styles.container}>
            <div className={styles.header}>
               <i
                  className="fa-solid fa-chevron-left"
                  onClick={() => history.back()}
               />{" "}
               &nbsp;
               {parseTeamKey(teamKey)} |{" "}
               {globData?.TBAdata.find((val) => val.key == teamKey)?.name}
            </div>
            <div className={styles.seperator} />
            <TeamDataCard />
         </div>
      </TeamDataContext.Provider>
   );
}

function TeamDataCard() {
   const teamRawData = useContext(TeamDataContext);
   const teamData = teamRawData?.data as unknown as PitData2025;
   const [teamImageUrl, setTeamImageUrl] = useState<string>();

   const params = useParams();
   const teamKey = params["team"] || "N/A";

   useEffect(() => {
      fetchTeamImage(teamKey || "", getEvent() || "").then((res) => {
         if (res) {
            setTeamImageUrl(res.publicUrl);
         }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const [, setShowBigImage] = useState<boolean>(false);

   return (
      <>
         {teamData?.comment
            ? (
               <>
                  <div className={styles.teamData}>
                     <div className={styles.image}>
                        {teamImageUrl
                           ? (
                              <img
                                 src={teamImageUrl}
                                 className={styles.teamImage}
                                 onClick={() => setShowBigImage(true)}
                              >
                              </img>
                           )
                           : "No image"}
                     </div>
                     <div className={styles.capabilities}>
                        <div className={styles.capabilityHeader}>
                           Abilities
                        </div>
                        <div className={styles.seperator} />
                        <div className={styles.capabilityHeader}>
                           Algae
                        </div>
                        {teamData.canGroundAlgae && (
                           <div className={styles.capEntry}>Ground Intake</div>
                        )}
                        {teamData.canReefAlgae && (
                           <div className={styles.capEntry}>Reef Intake</div>
                        )}
                        {teamData.canScoreNet && (
                           <div className={styles.capEntry}>Net</div>
                        )}
                        {teamData.canScoreProcessor && (
                           <div className={styles.capEntry}>Process</div>
                        )}
                        <div className={styles.seperator} />

                        <div className={styles.capabilityHeader}>
                           Coral
                        </div>
                        {teamData.canGroundCoral && (
                           <div className={styles.capEntry}>Ground Intake</div>
                        )}
                        {teamData.canSourceCoral && (
                           <div className={styles.capEntry}>Station Intake</div>
                        )}
                        <div className={styles.capEntry}>
                           {teamData.canScoreReef[0] && "L1"}{" "}
                           {teamData.canScoreReef[1] && "L2"}{" "}
                           {teamData.canScoreReef[2] && "L3"}{" "}
                           {teamData.canScoreReef[3] && "L4"}
                        </div>
                        <div className={styles.seperator} />

                        <div className={styles.capabilityHeader}>
                           Climb
                        </div>
                        {teamData.canClimbDeep && (
                           <div className={styles.capEntry}>Deep Climb</div>
                        )}
                        {teamData.canClimbShallow && (
                           <div className={styles.capEntry}>Shallow Climb</div>
                        )}
                     </div>
                  </div>
                  <div className={styles.teamReview}>
                     <div className={styles.reviewHeader}>
                        {teamRawData?.name}'s Review
                     </div>
                     {teamData?.robotArchetype}
                  </div>
               </>
            )
            : <div className={styles.loadBox}>No data found</div>}
      </>
   );
}
