import {
   createContext,
   Dispatch,
   SetStateAction,
   useContext,
   useEffect,
   useState,
} from "react";
import { useParams } from "wouter";
import styles from "./match.module.css";
import {
   getEvent,
   parseMatchKey,
   parseTeamKey,
} from "../../../utils/logic/app";
import { motion } from "motion/react";
import {
   AutoAction,
   CombinedMatchActions,
   CombinedMatchMetrics,
   TeleopAction,
} from "../../../schemas/defs";
import { Tables } from "../../../lib/supabase/database.types";
import { getLocalUserData } from "../../../lib/supabase/auth";
import { uploadMatch } from "../../../lib/supabase/data";
import {
   MatchMetrics,
   RobotActions,
   ScoreActions,
} from "../../../schemas/schema";
import { MatchContext } from "./matchCtx";
import throwNotification from "../../../components/app/toast/toast";

const MatchInfoContext = createContext<
   {
      matchKey: string;
      teamKey: string;
      alliance: "red" | "blue";
   } | null
>(null);

export interface MatchContextType {
   algaePosession: boolean;
   coralPosession: boolean;
   autoActions: AutoAction<2025>[];
   teleopActions: TeleopAction<2025>[];
   combinedActions: CombinedMatchActions<2025> | undefined;
   combinedMetrics: CombinedMatchMetrics<2025> | undefined;
   gameState: "unstarted" | "auto" | "teleop" | "end";
   gameElapsedMilliseconds: number;
   undo: () => void;
   redo: () => void;
   addAutoAction: (action: AutoAction<2025>) => void;
   addTeleAction: (action: TeleopAction<2025>) => void;
   setCombinedActions: Dispatch<
      SetStateAction<CombinedMatchActions<2025> | undefined>
   >;
   setCombinedMetrics: Dispatch<
      SetStateAction<CombinedMatchMetrics<2025> | undefined>
   >;
   startMatch: () => void;
   endMatch: (
      comment: string,
      drivingScore: number,
      defenseScore: number,
   ) => void;
   selectedAction: null | RobotActions[2025] | ScoreActions[2025];
   setSelectedAction: Dispatch<
      SetStateAction<null | RobotActions[2025] | ScoreActions[2025]>
   >;
   fieldOrientation: "normal" | "rotated";
}

export default function Inmatch2025() {
   const matchInfo = parseMatchString(useParams()[0] || "");

   /** Initializes state
    * The following functions initialize state for the current
    * scouting session
    */
   const [algaePosession, setAlgaePosession] = useState<boolean>(false);
   const [coralPosession, setCoralPosession] = useState<boolean>(false);
   const [autoActions, setAutoActions] = useState<AutoAction<2025>[]>([]);
   const [teleopActions, setTeleopActions] = useState<TeleopAction<2025>[]>([]);
   const [combinedActions, setCombinedActions] = useState<
      CombinedMatchActions<2025>
   >();
   const [combinedMetrics, setCombinedMetrics] = useState<
      CombinedMatchMetrics<2025>
   >();

   const [gameState, setGameState] = useState<
      "unstarted" | "auto" | "teleop" | "end"
   >("unstarted");
   const [gameElapsed, setGameElapsed] = useState<number>(0);

   const [autoRedoStack, setAutoRedoStack] = useState<AutoAction<2025>[]>([]);
   const [teleRedoStack, setTeleRedoStack] = useState<TeleopAction<2025>[]>([]);

   const [selectedAction, setSelectedAction] = useState<
      RobotActions[2025] | ScoreActions[2025] | null
   >(null);

   const [gameStartTime, setGameStartTime] = useState<number>();

   let matchInterval: NodeJS.Timeout;

   function undo() {
      const redoStack = gameState == "teleop"
         ? teleRedoStack.slice()
         : autoRedoStack.slice();
      const actions = gameState == "teleop"
         ? teleopActions.slice()
         : autoActions.slice();
      const undoVal = actions.pop();
      if (undoVal) redoStack.push(undoVal);
      if (gameState == "teleop") {
         setTeleopActions(actions);
         setTeleRedoStack(redoStack);
      } else if (gameState == "auto") {
         setAutoActions(actions);
         setAutoRedoStack(redoStack);
      }
   }

   function redo() {
      const redoStack = gameState == "teleop"
         ? teleRedoStack.slice()
         : autoRedoStack.slice();
      const actions = gameState == "teleop"
         ? teleopActions.slice()
         : autoActions.slice();
      const redoVal = redoStack.pop();
      if (redoVal) actions.push(redoVal);
      if (gameState == "teleop") {
         setTeleopActions(actions);
         setTeleRedoStack(redoStack);
      } else if (gameState == "auto") {
         setAutoActions(actions);
         setAutoRedoStack(redoStack);
      }
   }

   function addAutoAction(action: AutoAction<2025>) {
      setAutoActions((prev) => {
         return [...prev, action];
      });
   }

   function addTeleAction(action: TeleopAction<2025>) {
      setTeleopActions((prev) => {
         return [...prev, action];
      });
   }

   async function startMatch() {
      setGameState("auto");
      setGameElapsed(0);
      setGameStartTime(Date.now());

      const interval = setInterval(
         () => setGameElapsed(gameStartTime || 0 - Date.now()),
         10,
      );

      matchInterval = interval;
   }

   function endMatch(
      comment: string,
      drivingScore: number,
      defenseScore: number,
   ) {
      clearInterval(matchInterval);

      const matchTime = Date.now();

      const combinedActions: CombinedMatchActions<2025> = {
         gameYear: 2025,
         epochTime: Date.now(),
         teleopActions: teleopActions,
         autoActions: autoActions,
      };

      const combinedMetrics: CombinedMatchMetrics<2025> = {
         gameYear: 2025,
         epochTime: Date.now(),
         comment: comment,
         metrics: getMetricsFromRawData(
            combinedActions,
            defenseScore,
            drivingScore,
         ),
      };

      const newMatchEntry: Tables<"event_match_data"> = {
         event: getEvent() || "",
         alliance: matchInfo.alliance,
         match: matchInfo.matchKey,
         team: matchInfo.teamKey,
         data: combinedMetrics || {},
         data_raw: combinedActions || {},
         name: getLocalUserData().name,
         timestamp: new Date(matchTime).toISOString(),
         uid: getLocalUserData().uid,
      };

      uploadMatch(newMatchEntry);
   }

   function getMetricsFromRawData(
      data: CombinedMatchActions<2025>,
      defenseScore: number,
      drivingScore: number,
   ): MatchMetrics[2025] {
      let L1Scored: number = 0;
      let L2Scored: number = 0;
      let L3Scored: number = 0;
      let L4Scored: number = 0;
      let netScored: number = 0;
      let processorScored: number = 0;
      let totalAlgae: number = 0;
      let totalCoral: number = 0;
      let climbTime: number = 0;
      let climbDeep: boolean = false;
      let climbShallow: boolean = false;
      let failureTime: number = 0;

      const allActions = [...data.autoActions, ...data.teleopActions];

      for (const a of allActions) {
         const action = a.action;
         if (action == "scoreL1") L1Scored++;
         if (action == "scoreL2") L2Scored++;
         if (action == "scoreL3") L3Scored++;
         if (action == "scoreL4") L4Scored++;
         if (action == "scoreNet") netScored++;
         if (action == "scoreProcessor") processorScored++;
      }

      const climbEntry =
         allActions.filter((val) =>
            val.action == "climbDeep" || val.action == "climbShallow" ||
            val.action == "climbPark"
         )[0];

      if (climbEntry.action == "climbDeep") climbDeep = true;
      if (climbEntry.action == "climbShallow") climbShallow = true;

      climbTime = (gameStartTime || Date.now()) + 120 * 1000 -
         climbEntry.timestamp;

      let disabled = false;
      let disabledTime = 0;
      let reenabled = false;
      for (const a of allActions) {
         if (a.action == "robotDisabled") {
            disabled = true;
            disabledTime = a.timestamp;
         } else if (a.action == "robotReenabled") {
            disabled = false;
            reenabled = true;
            failureTime += a.timestamp - disabledTime;
         }
      }

      if (reenabled == false && disabled == true) {
         failureTime += gameStartTime || Date.now() + 120 * 1000 - disabledTime;
      }

      totalCoral = L1Scored + L2Scored + L3Scored + L4Scored;
      totalAlgae = netScored + processorScored;

      return {
         L1Scored: L1Scored,
         L2Scored: L2Scored,
         L3Scored: L3Scored,
         L4Scored: L4Scored,
         netScored: netScored,
         processorScored: processorScored,
         totalAlgae: totalAlgae,
         totalCoral: totalCoral,
         climbTime: climbTime,
         climbDeep: climbDeep,
         climbShallow: climbShallow,
         defenseScore: defenseScore,
         drivingScore: drivingScore,
         failureTime: failureTime,
      };
   }

   const ctxValue: MatchContextType = {
      algaePosession: algaePosession,
      coralPosession: coralPosession,
      autoActions: autoActions,
      teleopActions: teleopActions,
      combinedActions: combinedActions,
      combinedMetrics: combinedMetrics,
      gameState: gameState,
      gameElapsedMilliseconds: gameElapsed,
      undo: undo,
      redo: redo,
      addAutoAction: addAutoAction,
      addTeleAction: addTeleAction,
      setCombinedActions: setCombinedActions,
      setCombinedMetrics: setCombinedMetrics,
      startMatch: startMatch,
      endMatch: endMatch,
      selectedAction: selectedAction,
      setSelectedAction: setSelectedAction,
      fieldOrientation: "normal",
   };

   useEffect(() => {
      let algaePosession = false;
      let coralPosession = false;
      for (const action of [...autoActions, ...teleopActions]) {
         if (evaluateAction(action) == "lostAlgae") algaePosession = false;
         if (evaluateAction(action) == "lostCoral") coralPosession = true;
         if (evaluateAction(action) == "gainedAlgae") algaePosession = false;
         if (evaluateAction(action) == "gainedCoral") coralPosession = true;
      }
      setAlgaePosession(algaePosession);
      setCoralPosession(coralPosession);
   }, [autoActions, teleopActions]);

   function evaluateAction(
      action: AutoAction<2025> | TeleopAction<2025>,
   ): "lostAlgae" | "lostCoral" | "gainedAlgae" | "gainedCoral" | undefined {
      const actionName = action.action;
      if (
         actionName == "algaeDrop" || actionName == "algaeMiss" ||
         actionName == "scoreProcessor" || actionName == "scoreNet"
      ) return "lostAlgae";
      if (actionName == "algaePickup") return "gainedAlgae";
      if (
         actionName == "coralDrop" || actionName == "coralMiss" ||
         actionName.substring(0, 6) == "scoreL"
      ) return "lostCoral";
      if (actionName == "coralPickup") return "gainedCoral";
      return;
   }

   return (
      <MatchContext.Provider value={ctxValue}>
         <MatchInfoContext.Provider value={matchInfo}>
            <motion.div
               initial={{ opacity: 0, size: 0 }}
               animate={{ opacity: 1, size: 1 }}
               transition={{ duration: 0.2 }}
               className={styles.inmatchContainer}
            >
               <HelperSidebar />
               <FieldMap />
               <MatchControls />
               <TimeSidebar />
            </motion.div>
         </MatchInfoContext.Provider>
      </MatchContext.Provider>
   );
}

function HelperSidebar() {
   const matchCtx = useContext(MatchContext);
   const matchInfo = useContext(MatchInfoContext);

   return (
      <div className={styles.helperSidebar}>
         <div className={styles.helperSidebarHeader}>
            <div style={{ color: "var(--primary)" }}>
               {parseMatchKey(matchInfo?.matchKey || "", "short").split(" ")[0]
                  .substring(0, 1) +
                  parseMatchKey(matchInfo?.matchKey || "", "short").split(
                     " ",
                  )[1]}
            </div>
            {parseTeamKey(matchInfo?.teamKey || "")}
         </div>
         <div className={styles.helperSidebarIcons}>
            <img
               src={"/app/icons/algae.svg"}
               alt="Medal icon"
               className={styles.buttonIcon}
            />
            <img
               src={"/app/icons/coral.svg"}
               alt="Medal icon"
               className={styles.buttonIcon}
               style={{ // does not work lmao
                  fill: matchCtx?.coralPosession
                     ? "var(--primary)"
                     : "var(--text-secondary)",
               }}
            />
         </div>
         <div className={styles.helperSidebarControls}>
            <i className="fa-solid fa-gear" />
            <i className="fa-solid fa-rotate-left" onClick={matchCtx?.undo} />
            <i className="fa-solid fa-rotate-right" onClick={matchCtx?.redo} />
         </div>
      </div>
   );
}

function TimeSidebar() {
   const matchContext = useContext(MatchContext);
   return (
      <div className={styles.progressWrapper}>
         <progress
            className={styles.timeProgress}
            value={150 / (matchContext?.gameElapsedMilliseconds || 0.1 / 1000)}
         />
      </div>
   );
}

function FieldMap() {
   const matchContext = useContext(MatchContext);
   const matchInfo = useContext(MatchInfoContext);

   const svgAspectRatio = matchInfo?.alliance == "blue"
      ? "xMinYMid slice"
      : "xMaxYMid slice";

   const [currentPadding, setCurrentPadding] = useState(0);

   const calculatePadding = () => {
      const aspectRatio = window.innerHeight / window.innerWidth;
      const padding = aspectRatio > 1.8 ? 0 : Math.abs(aspectRatio - 1.8) * 15;
      setCurrentPadding(padding);
   };

   const handleClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (matchContext?.selectedAction) {
         const svg = event.currentTarget;
         const point = svg.createSVGPoint();
         point.x = event.clientX;
         point.y = event.clientY;

         const svgPoint = point.matrixTransform(svg!.getScreenCTM()!.inverse());

         if (matchContext.gameState == "auto") {
            matchContext.addAutoAction({
               timestamp: Date.now(),
               location: { x: svgPoint.x, y: svgPoint.y },
               action: matchContext.selectedAction,
            });
         } else if (matchContext.gameState == "teleop") {
            matchContext.addTeleAction({
               timestamp: Date.now(),
               location: { x: svgPoint.x, y: svgPoint.y },
               action: matchContext.selectedAction,
            });
         } else {
            throwNotification("error", "The match hasn't started/has ended");
         }

         matchContext.setSelectedAction(null);
      } else {
         throwNotification("error", "Select an action first");
      }
   };

   useEffect(() => {
      calculatePadding(); // Initial calculation
      window.addEventListener("resize", calculatePadding);

      return () => {
         window.removeEventListener("resize", calculatePadding);
      };
   }, []);

   return (
      <div
         style={{
            textAlign: "center",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--text-background)",
            borderRadius: "1rem",
            padding: `${currentPadding}rem 0`,
            overflow: "hidden",
            background: "var(--surface)",
            transform: matchContext?.fieldOrientation == "rotated"
               ? "rotate(180deg)"
               : "none",
         }}
      >
         <svg
            viewBox="0 0 1000 500"
            preserveAspectRatio={svgAspectRatio}
            style={{
               width: "100%",
               height: "105%",
               maxWidth: "100%",
               maxHeight: "105%",
            }}
            onClick={handleClick}
         >
            {/* Map */}
            <image
               href="/app/field/2025field.svg"
               x="0"
               y="0"
               width="1000"
               height="500"
            />

            {/* Render points */}
            {[...matchContext!.autoActions!, ...matchContext!.teleopActions!]
               .map((val) => {
                  return { x: val.location?.x, y: val.location?.y };
               }).map((point, index) => (
                  <circle
                     key={index}
                     cx={point.x}
                     cy={point.y}
                     r="10"
                     fill="rgba(200, 145, 50, 0.1)"
                  />
               ))}
         </svg>
      </div>
   );
}

function MatchControls() {
   const [selection] = useState<"algae" | "coral" | "climb" | null>(null);

   return (
      <>
         {!selection &&
            (
               <div className={styles.matchControls}>
                  <div
                     style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "0.5rem",
                        height: "100%",
                     }}
                  >
                     <div
                        style={{
                           display: "flex",
                           flexDirection: "column",
                           width: "100%",
                           gap: "0.5rem",
                        }}
                     >
                        <div className={styles.controlCategory}>
                           Algae
                        </div>
                        <div className={styles.controlCategory}>
                           Coral
                        </div>
                     </div>
                     <div className={styles.controlCategory}>
                        Climb
                     </div>
                  </div>
                  <div className={styles.disabled}>
                     disabled
                  </div>
               </div>
            )}
      </>
   );
}

function parseMatchString(matchString: string) {
   const params = matchString!.split("&");

   const result: {
      matchKey: string;
      teamKey: string;
      alliance: "red" | "blue";
   } = {
      matchKey: "n/a",
      teamKey: "n/a",
      alliance: "red",
   };

   params.forEach((param) => {
      const [key, value] = param.split("=");

      switch (key) {
         case "m":
            result.matchKey = value;
            break;
         case "t":
            result.teamKey = value.substring(1);
            break;
         case "a":
            if (value == "r") {
               result.alliance = "red";
            } else {
               result.alliance = "blue";
            }
            break;
      }
   });

   return result;
}
