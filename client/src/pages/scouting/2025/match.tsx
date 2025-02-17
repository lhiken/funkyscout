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
import { navigate } from "wouter/use-browser-location";

const MatchInfoContext = createContext<
   {
      matchKey: string;
      teamKey: string;
      alliance: "red" | "blue";
   } | null
>(null);

const DEBUG_MATCH_MODE = null;

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
   setFieldOrientation: Dispatch<SetStateAction<"normal" | "rotated">>;
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
   >("coralPickup");

   const [gameStartTime, setGameStartTime] = useState<number>();

   const [fieldOrientation, setFieldOrientation] = useState<
      "normal" | "rotated"
   >("normal");

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
      } else if (gameState == "auto" || gameState == "unstarted") {
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
      const startTime = Date.now();
      setGameStartTime(startTime);

      const interval = setInterval(
         () => {
            setGameElapsed(Date.now() - startTime);
         },
         100,
      );

      matchInterval = interval;
   }

   useEffect(() => {
      if (
         DEBUG_MATCH_MODE == null && gameElapsed > 15 * 1000 &&
         gameElapsed < 153 * 1000
      ) {
         setGameState("teleop");
      } else if (DEBUG_MATCH_MODE == null && gameElapsed >= 153 * 1000) {
         setGameState("end");
      } else if (DEBUG_MATCH_MODE != null) {
         setGameState(DEBUG_MATCH_MODE);
      }
   }, [gameElapsed]);

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

      uploadMatch(newMatchEntry).then((res) => {
         if (res) {
            throwNotification("success", "Match was uploaded");
         } else {
            throwNotification("success", "Match was saved but not uploaded");
         }
      }).finally(() => {
         navigate("/m/scout");
      });
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
         console.log(a);
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

      if (climbEntry) {
         if (climbEntry.action == "climbDeep") climbDeep = true;
         if (climbEntry.action == "climbShallow") climbShallow = true;

         climbTime = (gameStartTime || Date.now()) + 120 * 1000 -
            climbEntry.timestamp;
      }

      if (!climbEntry) {
         climbTime = -1;
      }

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
      fieldOrientation: fieldOrientation,
      setFieldOrientation: setFieldOrientation,
   };

   useEffect(() => {
      let algaePosession = false;
      let coralPosession = false;
      for (const action of [...autoActions, ...teleopActions]) {
         if (evaluateAction(action) == "lostAlgae") algaePosession = false;
         if (evaluateAction(action) == "lostCoral") coralPosession = false;
         if (evaluateAction(action) == "gainedAlgae") algaePosession = true;
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
            <svg
               width="25"
               height="25"
               viewBox="0 0 25 25"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
               style={{ transition: "0.2s" }}
            >
               <g clip-path="url(#clip0_1169_12)">
                  <circle
                     cx="12.5"
                     cy="12.5"
                     r="12.5"
                     fill={matchCtx?.algaePosession
                        ? "var(--primary)"
                        : "var(--text-background)"}
                  />
                  <path
                     d="M5.74192 15.6131C4.89353 16.1029 3.78967 15.8145 3.47547 14.8866C3.03593 13.5886 2.89608 12.1995 3.077 10.8253C3.3356 8.86101 4.23511 7.03696 5.63604 5.63604C7.03696 4.23511 8.86101 3.3356 10.8253 3.077C12.1995 2.89608 13.5886 3.03593 14.8866 3.47547C15.8145 3.78967 16.1029 4.89353 15.6131 5.74192C15.1233 6.59032 14.0344 6.84737 13.074 6.65441C12.49 6.53708 11.8868 6.51544 11.2883 6.59424C10.0983 6.7509 8.99328 7.29585 8.14457 8.14457C7.29585 8.99328 6.7509 10.0983 6.59424 11.2883C6.51544 11.8868 6.53708 12.49 6.65441 13.074C6.84737 14.0344 6.59032 15.1233 5.74192 15.6131Z"
                     fill="#0D0D0D"
                  />
               </g>
               <defs>
                  <clipPath id="clip0_1169_12">
                     <rect width="25" height="25" fill="white" />
                  </clipPath>
               </defs>
            </svg>
            <svg
               width="28"
               height="28"
               viewBox="0 0 28 28"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
               style={{ transition: "0.2s" }}
            >
               <path
                  d="M6.74192 17.6131C5.89353 18.1029 4.78967 17.8145 4.47547 16.8866C4.03593 15.5886 3.89608 14.1995 4.077 12.8253C4.3356 10.861 5.23511 9.03696 6.63604 7.63604C8.03696 6.23511 9.86101 5.3356 11.8253 5.077C13.1995 4.89608 14.5886 5.03593 15.8866 5.47547C16.8145 5.78967 17.1029 6.89353 16.6131 7.74192C16.1233 8.59032 15.0344 8.84737 14.074 8.65441C13.49 8.53708 12.8868 8.51544 12.2883 8.59424C11.0983 8.7509 9.99328 9.29585 9.14457 10.1446C8.29585 10.9933 7.7509 12.0983 7.59424 13.2883C7.51544 13.8868 7.53708 14.49 7.65441 15.074C7.84737 16.0344 7.59032 17.1233 6.74192 17.6131Z"
                  fill="#0D0D0D"
               />
               <rect
                  x="20.2759"
                  width="11.2205"
                  height="28.6746"
                  rx="1"
                  transform="rotate(45 20.2759 0)"
                  fill={matchCtx?.coralPosession
                     ? "var(--primary)"
                     : "var(--text-background)"}
               />
               <path
                  d="M19 7L9 17"
                  stroke="#0D0D0D"
                  strokeWidth="3"
                  strokeLinecap="round"
               />
            </svg>
         </div>
         <div className={styles.helperSidebarControls}>
            <i className="fa-solid fa-gear" />
            <i
               className="fa-solid fa-rotate-left"
               onClick={matchCtx?.gameState != "unstarted"
                  ? matchCtx?.undo
                  : undefined}
            />
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
            value={(153 - (matchContext?.gameElapsedMilliseconds || 0.1) /
                  1000) / 153}
         />
      </div>
   );
}
function FieldMap() {
   const matchContext = useContext(MatchContext);
   const matchInfo = useContext(MatchInfoContext);

   const svgAspectRatio = matchInfo?.alliance === "blue"
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

         const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());

         if (matchContext.gameState === "auto") {
            matchContext.addAutoAction({
               timestamp: Date.now(),
               location: { x: svgPoint.x, y: svgPoint.y },
               action: matchContext.selectedAction,
            });
         } else if (matchContext.gameState === "teleop") {
            matchContext.addTeleAction({
               timestamp: Date.now(),
               location: { x: svgPoint.x, y: svgPoint.y },
               action: matchContext.selectedAction,
            });
         } else if (
            matchContext.gameState === "unstarted" &&
            (matchContext.selectedAction === "coralPickup" ||
               matchContext.selectedAction === "coralDrop")
         ) {
            matchContext.addAutoAction({
               timestamp: -1,
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

   // Compute tangent vectors for each point.
   const computeTangents = (
      points: AutoAction<2025>[] | TeleopAction<2025>[],
   ) => {
      const tangents = [];
      const n = points.length;
      for (let i = 0; i < n; i++) {
         const p = points[i].location;
         let tangent;
         if (i === 0) {
            // For the first point, use the difference to the next point.
            const next = points[i + 1].location;
            tangent = { x: next!.x - p!.x, y: next!.y - p!.y };
         } else if (i === n - 1) {
            // For the last point, use the difference from the previous point.
            const prev = points[i - 1].location;
            tangent = { x: p!.x - prev!.x, y: p!.y - prev!.y };
         } else {
            // For interior points, use the average of the differences.
            const next = points[i + 1].location;
            const prev = points[i - 1].location;
            tangent = {
               x: (next!.x - prev!.x) / 2,
               y: (next!.y - prev!.y) / 2,
            };
         }
         tangents.push(tangent);
      }
      return tangents;
   };

   // Convert the Hermite spline to a cubic Bézier path.
   const computeHermitePath = (
      points: AutoAction<2025>[] | TeleopAction<2025>[],
   ) => {
      if (points.length < 2) return "";

      const tangents = computeTangents(points);
      let path = `M ${points[0]?.location?.x} ${points[0]?.location?.y}`;

      for (let i = 0; i < points.length - 1; i++) {
         const p0 = points[i].location;
         const p1 = points[i + 1].location;
         const m0 = tangents[i];
         const m1 = tangents[i + 1];

         // Convert Hermite to Bézier control points.
         const c1 = { x: p0!.x + m0.x / 3, y: p0!.y + m0.y / 3 };
         const c2 = { x: p1!.x - m1.x / 3, y: p1!.y - m1.y / 3 };

         path += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1!.x} ${p1!.y}`;
      }

      return path;
   };

   const allActions = [
      ...matchContext?.autoActions || [],
      ...matchContext?.teleopActions || [],
   ];
   const pathData = computeHermitePath(allActions);

   // Compute gradient endpoints based on the first and last point.
   const startPoint = allActions.length > 0
      ? allActions[0].location
      : { x: 0, y: 0 };
   const endPoint = allActions.length > 0
      ? allActions[allActions.length - 1].location
      : { x: 1000, y: 500 };

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
            transform: matchContext?.fieldOrientation === "rotated"
               ? "rotate(180deg)"
               : "none",
            opacity: matchContext?.selectedAction ? 1 : 0.4,
            transition: "0.2s",
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
            {/* Define the gradient for the spline */}
            <defs>
               <linearGradient
                  id="splineGradient"
                  gradientUnits="userSpaceOnUse"
                  x1={startPoint?.x}
                  y1={startPoint?.y}
                  x2={endPoint?.x}
                  y2={endPoint?.y}
               >
                  <stop offset="0%" stopColor="rgba(230, 80, 10, 0.02)" />
                  <stop offset="100%" stopColor="rgba(230, 180, 10, 0.02)" />
               </linearGradient>
            </defs>

            {/* Map */}
            <image
               href="/app/field/2025field.svg"
               x="0"
               y="0"
               width="1000"
               height="500"
            />

            {/* Draw Hermite spline as a cubic Bézier curve with gradient stroke and rounded caps */}
            {pathData && (
               <path
                  d={pathData}
                  stroke="url(#splineGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
            )}

            {/* Render points */}
            {allActions.map((point, index) => (
               <circle
                  key={index}
                  cx={point?.location?.x}
                  cy={point?.location?.y}
                  r={point.timestamp === -1 ? 25 : 12}
                  fill={`rgba(200, 145, 50, ${
                     point.timestamp === -1 ? 0.5 : 0.25
                  })`}
               />
            ))}
         </svg>
      </div>
   );
}

function MatchControls() {
   const matchContext = useContext(MatchContext);

   const [selection, setSelection] = useState<
      "algae" | "coral" | "climb" | "defense" | null
   >(null);

   const [disabled, setDisabled] = useState<boolean>(false);

   function handleDisabled() {
      if (matchContext?.gameState == "teleop") {
         if (!disabled) {
            matchContext.setSelectedAction("robotDisabled");
            setDisabled(true);
         } else {
            matchContext.setSelectedAction("robotReenabled");
            setDisabled(false);
         }
      }
   }

   function handleSelectAction(
      action: RobotActions[2025] | ScoreActions[2025],
      nullify?: boolean,
   ) {
      if (nullify) {
         setSelection(null);
         return;
      }
      if (matchContext?.gameState != "unstarted") {
         if (matchContext?.selectedAction == action) {
            matchContext.setSelectedAction(null);
         } else {
            matchContext?.setSelectedAction(action);
         }
      }
   }

   const [showMatchSummary, setShowMatchSummary] = useState<boolean>(false);

   function handleMatchSummaryClick() {
      console.log(matchContext?.autoActions);
      console.log(matchContext?.teleopActions);
      setShowMatchSummary(true);
   }

   return (
      <>
         {matchContext?.gameState == "unstarted" &&
            (
               <div className={styles.previewStage}>
                  Define starting configuration
                  <div
                     className={styles.startingButton}
                     onClick={() =>
                        matchContext.setFieldOrientation((prev) =>
                           prev == "normal" ? "rotated" : "normal"
                        )}
                  >
                     Flip field
                  </div>
                  <div
                     style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1rem",
                     }}
                  >
                     <div
                        className={styles.startingButton}
                        style={{
                           opacity: matchContext.autoActions.length > 0
                              ? 1
                              : 0.5,
                        }}
                        onClick={() => {
                           if (matchContext.autoActions.length > 0) {
                              matchContext.undo();
                              matchContext.setSelectedAction("coralPickup");
                           }
                        }}
                     >
                        Reset starting position
                     </div>
                     <div
                        className={styles.startingButton}
                        style={{
                           opacity: matchContext.autoActions.length > 0
                              ? 1
                              : 0.5,
                        }}
                        onClick={() => {
                           if (matchContext.autoActions.length > 0) {
                              matchContext.startMatch();
                           }
                        }}
                     >
                        Start match<i className="fa-solid fa-play" />
                     </div>
                  </div>
               </div>
            )}
         {!selection && (matchContext?.gameState == "auto" ||
            matchContext?.gameState == "teleop") &&
            (
               <div className={styles.matchControls}>
                  <div
                     style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "0.75rem",
                        height: "100%",
                     }}
                  >
                     <div
                        style={{
                           display: "flex",
                           flexDirection: "column",
                           width: "100%",
                           gap: "0.75rem",
                        }}
                     >
                        <div
                           className={styles.controlCategory}
                           style={{ height: "200%" }}
                           onClick={() => setSelection("defense")}
                        >
                           Defense
                        </div>
                        <div
                           className={styles.controlCategory}
                           onClick={() => setSelection("climb")}
                        >
                           Climb
                        </div>
                     </div>
                     <div
                        style={{
                           display: "flex",
                           flexDirection: "column",
                           width: "100%",
                           gap: "0.75rem",
                        }}
                     >
                        <div
                           className={styles.controlCategory}
                           onClick={() => setSelection("coral")}
                        >
                           Coral
                        </div>
                        <div
                           className={styles.controlCategory}
                           onClick={() => setSelection("algae")}
                        >
                           Algae
                        </div>
                     </div>
                  </div>
                  <div className={styles.disabled} onClick={handleDisabled}>
                     {disabled ? "reenable" : "disable"}
                  </div>
               </div>
            )}
         {selection == "algae" && matchContext?.gameState != "end" && (
            <AlgaeSelections selectAction={handleSelectAction} />
         )}
         {selection == "coral" && matchContext?.gameState != "end" && (
            <CoralSelections selectAction={handleSelectAction} />
         )}
         {selection == "climb" && matchContext?.gameState != "end" && (
            <ClimbSelections selectAction={handleSelectAction} />
         )}
         {selection == "defense" && matchContext?.gameState != "end" && (
            <DefenseSelections selectAction={handleSelectAction} />
         )}
         {matchContext?.gameState == "end" &&
            (
               <div className={styles.previewStage}>
                  Match has ended
                  <div className={styles.statsBox}>
                     Coral Scored: {[
                        ...matchContext.autoActions,
                        ...matchContext.teleopActions,
                     ].filter((val) => val.action.substring(0, 6) == "scoreL")
                        .length}
                     <br />
                     Algae Scored: {[
                        ...matchContext.autoActions,
                        ...matchContext.teleopActions,
                     ].filter((val) => val.action == "scoreNet" ||
                        val.action == "scoreProcessor"
                     )
                        .length}
                  </div>
                  <div
                     className={styles.endMatch}
                     onClick={handleMatchSummaryClick}
                  >
                     Go to match summary
                  </div>
               </div>
            )}
         {showMatchSummary && <MatchEndingNotes />}
      </>
   );
}

function ReturnComponent(
   { selectAction }: {
      selectAction: (
         action: RobotActions[2025] | ScoreActions[2025],
         nullify: boolean,
      ) => void;
   },
) {
   return (
      <div
         className={styles.returnControl}
         onClick={() => selectAction("leaveLine", true)}
      >
         Return <i className="fa-solid fa-rotate-left" />
      </div>
   );
}

function CoralSelections(
   { selectAction }: {
      selectAction: (
         action: RobotActions[2025] | ScoreActions[2025],
         nullify?: boolean,
      ) => void;
   },
) {
   const matchContext = useContext(MatchContext);

   return (
      <div className={styles.matchControls}>
         <div
            style={{
               display: "flex",
               flexDirection: "row",
               height: "100%",
               gap: "0.75rem",
            }}
         >
            <div
               style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                  gap: "0.75rem",
                  opacity: matchContext?.coralPosession ? 1 : 0.5,
               }}
            >
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "scoreL4"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                  }}
                  onClick={() =>
                     matchContext?.coralPosession && selectAction("scoreL4")}
               >
                  Score L4
               </div>
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "scoreL3"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                  }}
                  onClick={() =>
                     matchContext?.coralPosession && selectAction("scoreL3")}
               >
                  Score L3
               </div>
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "scoreL2"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                  }}
                  onClick={() =>
                     matchContext?.coralPosession && selectAction("scoreL2")}
               >
                  Score L2
               </div>
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "scoreL1"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                  }}
                  onClick={() =>
                     matchContext?.coralPosession && selectAction("scoreL1")}
               >
                  Score L1
               </div>
            </div>
            <div
               style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                  gap: "0.75rem",
               }}
            >
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "coralPickup"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                     opacity: matchContext?.coralPosession ? 0.5 : 1,
                  }}
                  onClick={() =>
                     !matchContext?.coralPosession &&
                     selectAction("coralPickup")}
               >
                  Pickup Coral
               </div>
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "coralMiss"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                     opacity: matchContext?.coralPosession ? 1 : 0.5,
                  }}
                  onClick={() =>
                     matchContext?.coralPosession && selectAction("coralMiss")}
               >
                  Miss Coral
               </div>
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "coralDrop"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                     opacity: matchContext?.coralPosession ? 1 : 0.5,
                  }}
                  onClick={() =>
                     matchContext?.coralPosession && selectAction("coralDrop")}
               >
                  Drop Coral
               </div>
            </div>
         </div>
         <ReturnComponent selectAction={selectAction} />
      </div>
   );
}

function AlgaeSelections(
   { selectAction }: {
      selectAction: (
         action: RobotActions[2025] | ScoreActions[2025],
         nullify?: boolean,
      ) => void;
   },
) {
   const matchContext = useContext(MatchContext);

   return (
      <div className={styles.matchControls}>
         <div
            style={{
               display: "flex",
               flexDirection: "row",
               height: "100%",
               gap: "0.75rem",
            }}
         >
            <div
               style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                  gap: "0.75rem",
                  opacity: matchContext?.algaePosession ? 1 : 0.5,
               }}
            >
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "scoreProcessor"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                  }}
                  onClick={() =>
                     matchContext?.algaePosession &&
                     selectAction("scoreProcessor")}
               >
                  Processor
               </div>
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "scoreNet"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                  }}
                  onClick={() =>
                     matchContext?.algaePosession && selectAction("scoreNet")}
               >
                  Net
               </div>
            </div>
            <div
               style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                  gap: "0.75rem",
               }}
            >
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "algaePickup"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                     opacity: matchContext?.algaePosession ? 0.5 : 1,
                  }}
                  onClick={() =>
                     !matchContext?.algaePosession &&
                     selectAction("algaePickup")}
               >
                  Pickup Algae
               </div>
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "algaeMiss"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                     opacity: matchContext?.algaePosession ? 1 : 0.5,
                  }}
                  onClick={() =>
                     matchContext?.algaePosession && selectAction("algaeMiss")}
               >
                  Miss Algae
               </div>
               <div
                  className={styles.selectionButton}
                  style={{
                     color: matchContext?.selectedAction == "algaeDrop"
                        ? "var(--primary)"
                        : "var(--text-primary)",
                     opacity: matchContext?.algaePosession ? 1 : 0.5,
                  }}
                  onClick={() =>
                     matchContext?.algaePosession && selectAction("algaeDrop")}
               >
                  Drop Algae
               </div>
            </div>
         </div>
         <ReturnComponent selectAction={selectAction} />
      </div>
   );
}

function ClimbSelections(
   { selectAction }: {
      selectAction: (
         action: RobotActions[2025] | ScoreActions[2025],
         nullify?: boolean,
      ) => void;
   },
) {
   const matchContext = useContext(MatchContext);

   return (
      <div className={styles.matchControls}>
         <div
            className={styles.selectionButton}
            style={{
               color: matchContext?.selectedAction == "climbDeep"
                  ? "var(--primary)"
                  : "var(--text-primary)",
            }}
            onClick={() => selectAction("climbDeep")}
         >
            Deep Climb
         </div>
         <div
            className={styles.selectionButton}
            style={{
               color: matchContext?.selectedAction == "climbShallow"
                  ? "var(--primary)"
                  : "var(--text-primary)",
            }}
            onClick={() => selectAction("climbShallow")}
         >
            Shallow Climb
         </div>
         <div
            className={styles.selectionButton}
            style={{
               color: matchContext?.selectedAction == "climbPark"
                  ? "var(--primary)"
                  : "var(--text-primary)",
            }}
            onClick={() => selectAction("climbPark")}
         >
            Park
         </div>
         <ReturnComponent selectAction={selectAction} />
      </div>
   );
}

function DefenseSelections(
   { selectAction }: {
      selectAction: (
         action: RobotActions[2025] | ScoreActions[2025],
         nullify?: boolean,
      ) => void;
   },
) {
   const matchContext = useContext(MatchContext);

   return (
      <div className={styles.matchControls}>
         <div
            className={styles.selectionButton}
            style={{
               color: matchContext?.selectedAction == "defend"
                  ? "var(--primary)"
                  : "var(--text-primary)",
            }}
            onClick={() => selectAction("defend")}
         >
            Play defense
         </div>
         <div
            className={styles.selectionButton}
            style={{
               color: matchContext?.selectedAction == "beDefended"
                  ? "var(--primary)"
                  : "var(--text-primary)",
            }}
            onClick={() => selectAction("beDefended")}
         >
            Be defended
         </div>
         <ReturnComponent selectAction={selectAction} />
      </div>
   );
}

function MatchEndingNotes() {
   const [driverRating, setDriverRating] = useState<number>(3);
   const handleDriverRatingChange = (
      e: React.ChangeEvent<HTMLInputElement>,
   ) => {
      setDriverRating(Math.round(Number(e.target.value)));
   };

   const matchContext = useContext(MatchContext);

   const [robotRating, setRobotRating] = useState<number>(3);
   const handleRobotRatingChange = (
      e: React.ChangeEvent<HTMLInputElement>,
   ) => {
      setRobotRating(Math.round(Number(e.target.value)));
   };

   const [teamNotes, setTeamNotes] = useState<string>();

   function handleUploadMatch() {
      if (teamNotes && teamNotes.trim().length > 0) {
         matchContext?.endMatch(teamNotes, driverRating / 5, robotRating / 5);
      } else {
         throwNotification("error", "Notes can't be blank");
      }
   }

   return (
      <div className={styles.finalContainer}>
         <div className={styles.notesContainer}>
            <div className={styles.header}>
               Match Notes
            </div>
            <div className={styles.notesCategory}>
               <div className={styles.notesHeader}>
                  Driver Rating
               </div>
               <div
                  className={styles.ratingSlider}
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
                           left: `${((driverRating - 1) / (5 - 1)) * 100}%`,
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
                     step={0.1}
                     value={driverRating}
                     onChange={handleDriverRatingChange}
                     style={{ width: "100%", opacity: 0 }}
                  />
               </div>
            </div>
            <div className={styles.notesCategory}>
               <div className={styles.notesHeader}>
                  Robot Rating
               </div>
               <div
                  className={styles.ratingSlider}
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
                           left: `${((robotRating - 1) / (5 - 1)) * 100}%`,
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
                     step={0.1}
                     value={robotRating}
                     onChange={handleRobotRatingChange}
                     style={{ width: "100%", opacity: 0 }}
                  />
               </div>
            </div>
            <div className={styles.notesCategory}>
               <div className={styles.notesHeader}>
                  Team Notes
               </div>
               <textarea
                  className={styles.inputBox}
                  id="textBox"
                  value={teamNotes}
                  placeholder="Write down some notes about this team's performance this match"
                  onChange={(e) => setTeamNotes(e.target.value)}
               />
            </div>
         </div>
         <div className={styles.uploadButton} onClick={handleUploadMatch}>
            Save/upload match
            <i
               style={{ fontSize: "1.15rem", lineHeight: "1rem" }}
               className="fa-solid fa-floppy-disk"
            />
         </div>
      </div>
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
