import { useParams } from "wouter";
import styles from "./team.module.css";
import {
   getEvent,
   parseMatchKey,
   parseTeamKey,
} from "../../../../../utils/logic/app";
import { createContext, useContext, useEffect, useState } from "react";
import { GlobalTeamDataContext } from "../../../../../app-global-ctx";
import {
   fetchMatchDataByEvent,
   fetchSpecificTeamDataByEvent,
   fetchTeamImage,
} from "../../../../../lib/supabase/data";
import { Tables } from "../../../../../lib/supabase/database.types";
import { CombinedMatchMetrics, PitData2025 } from "../../../../../schemas/defs";
import { DataParser2025 } from "../../../../../schemas/parser";

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
   const [parser, setParser] = useState<DataParser2025>();
   const [teamMatches, setTeamMatches] = useState<
      Tables<"event_match_data">[]
   >();
   const [teleAvg, setTeleAvg] = useState(-1);
   const [autoAvg, setAutoAvg] = useState(-1);
   const params = useParams();
   const teamKey = params["team"] || "N/A";
   const globInfo = useContext(GlobalTeamDataContext);

   const tbaTeam = globInfo.TBAdata.find((val) => val.key == teamKey);

   useEffect(() => {
      fetchTeamImage(teamKey || "", getEvent() || "").then((res) => {
         if (res) {
            setTeamImageUrl(res.publicUrl);
         }
      });

      fetchMatchDataByEvent(getEvent() || "").then((res) => {
         if (res) {
            setParser(new DataParser2025(res, teamKey));
            setTeamMatches(res.filter((val) => val.team == teamKey));
            console.log(res);
            console.log(res.filter((val) => val.team == teamKey));
         }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      const av = getAvg();
      setTeleAvg(av.tele);
      setAutoAvg(av.auto);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [parser]);

   const [showBigImage, setShowBigImage] = useState<boolean>(false);

   const getAvg = () => {
      const matches = teamMatches?.map((val) => val.match) || [];
      console.log(matches);
      let teleAvg = 0;
      let autoAvg = 0;
      for (const match of matches) {
         teleAvg += parser?.getMatchTeamPoints(match, teamKey).tele || 0;
         autoAvg += parser?.getMatchTeamPoints(match, teamKey).auto || 0;
      }

      teleAvg /= matches.length;
      autoAvg /= matches.length;

      return {
         auto: autoAvg,
         tele: teleAvg,
      };
   };

   return (
      <>
         {showBigImage && (
            <div
               className={styles.bigImageContainer}
               onClick={() => setShowBigImage(false)}
            >
               <img
                  className={styles.bigImage}
                  src={teamImageUrl}
               >
               </img>
            </div>
         )}
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
                           Scouted {teamMatches?.length || 0}/10
                        </div>
                        <div className={styles.capEntry}>
                           Rank #{tbaTeam?.rank}
                        </div>
                        <div className={styles.capEntry}>
                           Next:{"   "}
                           {parseMatchKey(tbaTeam?.nextMatch || "", "short")}
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
            : <div className={styles.loadBox}>No pit data found</div>}
         <div className={styles.teamReview}>
            <div className={styles.reviewHeader}>
               Overall Performance
               <div className={styles.perfContainer}>
                  <div className={styles.perfCard}>
                     Total Avg.
                     <div style={{ fontSize: "1.5rem" }}>
                        {(autoAvg + teleAvg).toFixed(1)}
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     Tele Avg.
                     <div style={{ fontSize: "1.5rem" }}>
                        {teleAvg.toFixed(1)}
                     </div>
                  </div>
                  <div className={styles.perfCard}>
                     Auto Avg.
                     <div style={{ fontSize: "1.5rem" }}>
                        {autoAvg.toFixed(1)}
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className={styles.reviews}>
            {teamMatches?.map((val, index) => {
               return (
                  <div key={index} className={styles.reviewCard}>
                     <div className={styles.reviewCardHeader}>
                        {parseMatchKey(val.match, "short")} | {val.name}
                     </div>
                     {(val.data as CombinedMatchMetrics<2025>).comment}
                  </div>
               );
            })}
         </div>
      </>
   );
}
