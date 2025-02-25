import { useLocation, useParams } from "wouter";
import styles from "./pit.module.css";
import { parseTeamKey } from "../../../utils/logic/app";
import { useContext, useState } from "react";
import { GlobalTeamDataContext } from "../../../app-global-ctx";
import { PitData2025 } from "../../../schemas/defs";
import { uploadPitEntry, uploadRobotImage } from "../../../lib/supabase/data";

export default function Inpit2025() {
   const teamKey = useParams()[0] || "No team selected";
   const globalData = useContext(GlobalTeamDataContext);
   const [, navigate] = useLocation();

   const [page, setPage] = useState(0);

   const [groundCoral, setGroundCoral] = useState<boolean>(false);
   const [sourceCoral, setSourceCoral] = useState<boolean>(false);
   const [groundAlgae, setGroundAlgae] = useState<boolean>(false);
   const [reefAlgae, setReefAlgae] = useState<boolean>(false);
   const [reefCoral, setReefCoral] = useState<
      [boolean, boolean, boolean, boolean]
   >([false, false, false, false]);
   const [processorAlgae, setProcessorAlgae] = useState<boolean>(false);
   const [netAlgae, setNetAlgae] = useState<boolean>(false);
   const [deepClimb, setDeepClimb] = useState<boolean>(false);
   const [shallowClimb, setShallowClimb] = useState<boolean>(false);

   const [robotArchetype, setRobotArchetype] = useState<string>("");

   const [subjectiveRating, setSubjectiveRating] = useState<number>(3);
   const [robotRobustness, setRobotRobustness] = useState<number>(3);

   const [robotImage, setRobotImage] = useState<File>();

   function handleLeftButton() {
      if (page == 1) {
         setPage(0);
      }
   }

   function handleRightButton() {
      if (page == 0) {
         setPage(1);
      } else if (robotArchetype?.length > 0 && robotImage) {
         const newPitData: PitData2025 = {
            canScoreReef: reefCoral,
            canScoreNet: netAlgae,
            canScoreProcessor: processorAlgae,
            canClimbDeep: deepClimb,
            canClimbShallow: shallowClimb,
            canGroundAlgae: groundAlgae,
            canGroundCoral: groundCoral,
            canSourceCoral: sourceCoral,
            canReefAlgae: reefAlgae,
            robotHeightInches: -1,
            robotWeightPounds: -1,
            robotArchetype: robotArchetype || "No data",
            subjectiveRating: subjectiveRating,
            robotRobustness: robotRobustness,
            comment: "N/A",
         };

         uploadRobotImage(robotImage, teamKey);
         uploadPitEntry(teamKey, newPitData);
      }
   }

   function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
      if (event.target.files && event.target.files[0]) {
         setRobotImage(event.target.files[0]);
      }
   }

   return (
      <>
         <div className={styles.container}>
            <div className={styles.header}>
               <div className={styles.headerInfo}>
                  {parseTeamKey(teamKey)}{" "}
                  {globalData.TBAdata.find((val) => val.key == teamKey)?.name ||
                     ""}
                  <div>
                     <i
                        className="fa-solid fa-xmark"
                        onClick={() => navigate("~/m/scout/pit")}
                     />
                  </div>
               </div>
               <div className={styles.seperator} />
            </div>
            <div className={styles.content}>
               {page == 0
                  ? (
                     <>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Coral Intake
                           </div>
                           <div className={styles.optionContent}>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: groundCoral
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() => setGroundCoral((p) => !p)}
                              >
                                 Ground
                              </div>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: sourceCoral
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() => setSourceCoral((p) => !p)}
                              >
                                 Coral Station
                              </div>
                           </div>
                        </div>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Coral Scoring
                           </div>
                           <div className={styles.optionContent}>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: reefCoral[0]
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() =>
                                    setReefCoral((
                                       p,
                                    ) => [!p[0], p[1], p[2], p[3]])}
                              >
                                 L1
                              </div>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: reefCoral[1]
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() =>
                                    setReefCoral((
                                       p,
                                    ) => [p[0], !p[1], p[2], p[3]])}
                              >
                                 L2
                              </div>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: reefCoral[2]
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() =>
                                    setReefCoral((
                                       p,
                                    ) => [p[0], p[1], !p[2], p[3]])}
                              >
                                 L3
                              </div>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: reefCoral[3]
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() =>
                                    setReefCoral((
                                       p,
                                    ) => [p[0], p[1], p[2], !p[3]])}
                              >
                                 L4
                              </div>
                           </div>
                        </div>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Algae Intake
                           </div>
                           <div className={styles.optionContent}>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: groundAlgae
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() => setGroundAlgae((p) => !p)}
                              >
                                 Ground
                              </div>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: reefAlgae
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() => setReefAlgae((p) => !p)}
                              >
                                 Reef
                              </div>
                           </div>
                        </div>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Algae Scoring
                           </div>
                           <div className={styles.optionContent}>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: netAlgae
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() => setNetAlgae((p) => !p)}
                              >
                                 Net
                              </div>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: processorAlgae
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() => setProcessorAlgae((p) => !p)}
                              >
                                 Processor
                              </div>
                           </div>
                        </div>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Climb
                           </div>
                           <div className={styles.optionContent}>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: deepClimb
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() => setDeepClimb((p) => !p)}
                              >
                                 Deep
                              </div>
                              <div
                                 className={styles.optionOption}
                                 style={{
                                    backgroundColor: shallowClimb
                                       ? "var(--text-background)"
                                       : "",
                                 }}
                                 onClick={() => setShallowClimb((p) => !p)}
                              >
                                 Shallow
                              </div>
                           </div>
                        </div>
                     </>
                  )
                  : (
                     <>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Subjective Rating
                           </div>
                           <div
                              className={styles.ratingSlider}
                              style={{ position: "relative" }}
                           >
                              <div
                                 style={{
                                    width: "100%",
                                    height: "0.35rem",
                                    borderRadius: "1rem",
                                    background: "var(--primary-variant)",
                                    position: "relative",
                                 }}
                              >
                                 <div
                                    style={{
                                       position: "absolute",
                                       left: `${
                                          ((subjectiveRating - 1) / (5 - 1)) *
                                          100
                                       }%`,
                                       top: "50%",
                                       transform: "translate(-50%, -50%)",
                                       width: "1rem",
                                       height: "1rem",
                                       background: "var(--primary)",
                                       borderRadius: "50%",
                                    }}
                                 />
                              </div>
                              <input
                                 type="range"
                                 min={1}
                                 max={5}
                                 step={1}
                                 value={subjectiveRating}
                                 onChange={(e) =>
                                    setSubjectiveRating(Number(e.target.value))}
                                 style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4rem",
                                    opacity: 0,
                                    cursor: "pointer",
                                    pointerEvents: "auto",
                                 }}
                              />
                           </div>
                        </div>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Robot Robustness
                           </div>
                           <div
                              className={styles.ratingSlider}
                              style={{ position: "relative" }}
                           >
                              <div
                                 style={{
                                    width: "100%",
                                    height: "0.35rem",
                                    borderRadius: "1rem",
                                    background: "var(--primary-variant)",
                                    position: "relative",
                                 }}
                              >
                                 <div
                                    style={{
                                       position: "absolute",
                                       left: `${
                                          ((robotRobustness - 1) / (5 - 1)) *
                                          100
                                       }%`,
                                       top: "50%",
                                       transform: "translate(-50%, -50%)",
                                       width: "1rem",
                                       height: "1rem",
                                       background: "var(--primary)",
                                       borderRadius: "50%",
                                    }}
                                 />
                              </div>
                              <input
                                 type="range"
                                 min={1}
                                 max={5}
                                 step={1}
                                 value={robotRobustness}
                                 onChange={(e) =>
                                    setRobotRobustness(Number(e.target.value))}
                                 style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "4rem",
                                    opacity: 0,
                                    cursor: "pointer",
                                    pointerEvents: "auto",
                                 }}
                              />
                           </div>
                        </div>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Robot Description
                           </div>
                           <textarea
                              className={styles.inputBox}
                              id="textBox"
                              value={robotArchetype}
                              placeholder="Write down a short description of this robot and notable features you see"
                              onChange={(e) =>
                                 setRobotArchetype(e.target.value)}
                           />
                        </div>
                        <div className={styles.option}>
                           <div className={styles.optionHeader}>
                              Robot Description
                           </div>
                           <label className={styles.uploadButton}>
                              {robotImage
                                 ? "Image uploaded"
                                 : "Upload a GOOD image of the robot"}
                              {robotImage
                                 ? (
                                    <img
                                       src={URL.createObjectURL(robotImage)}
                                       alt="Uploaded"
                                       style={{
                                          width: "2rem",
                                          height: "2rem",
                                          borderRadius: "1rem",
                                          marginLeft: "0.5rem",
                                       }}
                                    />
                                 )
                                 : (
                                    <i
                                       style={{
                                          fontSize: "2rem",
                                          marginLeft: "0.5rem",
                                       }}
                                       className="fa-solid fa-upload"
                                    />
                                 )}
                              <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleFileUpload}
                                 style={{ display: "none" }}
                              />
                           </label>
                        </div>
                     </>
                  )}
            </div>
            <div className={styles.navigator}>
               <div
                  className={styles.navButton}
                  onClick={handleLeftButton}
                  style={{ opacity: page == 1 ? 1 : 0 }}
               >
                  Back
               </div>
               <div
                  className={styles.navButton}
                  onClick={handleRightButton}
                  style={{
                     opacity: page == 0 ||
                           (robotImage && (robotArchetype?.length || 0) > 0)
                        ? 1
                        : 0.5,
                  }}
               >
                  {page == 0 ? "Next" : "Submit"}
               </div>
            </div>
         </div>
      </>
   );
}
