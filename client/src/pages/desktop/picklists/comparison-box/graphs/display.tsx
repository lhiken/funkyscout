import { useEffect, useMemo, useState } from "react";
import { Tables } from "../../../../../lib/supabase/database.types";
import {
   AutoAction,
   CombinedMatchActions,
   TeleopAction,
} from "../../../../../schemas/defs";
import Tippy from "@tippyjs/react";
import styles from "./display.module.css";
import { motion } from "motion/react";
import Checkbox from "../../../../../components/app/buttons/checkbox";

function MatchReplayFieldMap({
   matchData,
}: {
   matchData: Tables<"event_match_data">;
}) {
   // Transform raw data from matchData (if available)
   const rawData = useMemo(() => {
      function transformCoords(data: CombinedMatchActions<2025>) {
         if (data?.teleopActions[0]) {
            const newAuto = data.autoActions.map((val) => ({
               location: {
                  x: Math.abs(val.location?.y || 0),
                  y: Math.abs(val.location?.x || 0),
               },
               timestamp: val.timestamp,
               action: val.action,
            }));

            // Ensure first action is always the starting position
            if (newAuto[0]) {
               newAuto[0].action = "startingPosition";
               newAuto[0].timestamp = newAuto[1]
                  ? newAuto[1].timestamp - 2000
                  : data.teleopActions[data.teleopActions.length - 1]
                     .timestamp -
                     155 * 1000;
            }

            const newTele = data.teleopActions.map((val) => ({
               location: {
                  x: Math.abs(val.location?.y || 0),
                  y: Math.abs(val.location?.x || 0),
               },
               timestamp: val.timestamp,
               action: val.action,
            }));

            return {
               autoActions: newAuto,
               teleopActions: newTele,
               epochTime: data.epochTime,
               gameYear: data.gameYear,
            };
         }
         return null;
      }

      return matchData.data_raw
         ? transformCoords(matchData.data_raw as CombinedMatchActions<2025>)
         : null;
   }, [matchData]);

   // State to control which actions are shown
   const [showAuto, setShowAuto] = useState<boolean>(true);
   const [showTeleop, setShowTeleop] = useState<boolean>(true);
   const [showLabels, setShowLabels] = useState<boolean>(false);

   // Filter actions based on settings
   const autoActions = showAuto && rawData ? rawData.autoActions : [];
   const teleopActions = showTeleop && rawData ? rawData.teleopActions : [];
   // eslint-disable-next-line react-hooks/exhaustive-deps
   const combinedActions = useMemo(() => [...autoActions, ...teleopActions], [
      matchData,
      showAuto,
      showTeleop,
   ]);

   // Sorted actions by timestamp
   const sortedActions = useMemo(() => {
      return combinedActions.slice().sort((a, b) => a.timestamp - b.timestamp);
   }, [combinedActions]);

   // Compute start and end timestamps
   const startTimestamp = sortedActions[0]?.timestamp || 0;
   const endTimestamp =
      sortedActions[sortedActions.length - 1]?.timestamp + 1000 || 0;

   // Reset currentTime when matchData (or filtered actions) change so that timeline is synced
   const [currentTime, setCurrentTime] = useState(endTimestamp);
   useEffect(() => {
      setCurrentTime(endTimestamp);
   }, [matchData, endTimestamp]);

   // Smooth easing function (ease in out cubic)
   const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
   };

   // Dynamic color generation function
   const generateColorPalette = (
      actions: (AutoAction<2025> | TeleopAction<2025>)[],
   ) => {
      const uniqueActionTypes = [
         ...new Set(actions.map((action) => action.action)),
      ];

      const colorMap: { [key: string]: string } = {};
      uniqueActionTypes.forEach((type, index) => {
         const hue = (index * 360 / uniqueActionTypes.length) % 360;
         colorMap[type] = `hsla(${hue}, 70%, 70%, 0.7)`;
      });

      return {
         colorMap,
         defaultColor: "rgba(200, 145, 50, 0.7)",
      };
   };

   const { colorMap, defaultColor } = generateColorPalette(combinedActions);

   // Filter actions that should be displayed based on currentTime
   const filteredActions = sortedActions.filter(
      (action) => action.timestamp <= currentTime,
   );

   const computePath = (
      points: (AutoAction<2025> | TeleopAction<2025>)[],
   ) => {
      if (points.length < 2) return "";

      let path = `M ${points[0].location?.x || 0} ${
         points[0].location?.y || 0
      }`;

      for (let i = 1; i < points.length; i++) {
         const p = points[i].location;
         path += ` L ${p?.x || 0} ${p?.y || 0}`;
      }

      return path;
   };

   // Current robot position calculation with non-linear interpolation
   const getCurrentPosition = () => {
      if (sortedActions.length === 0) return null;

      if (currentTime >= endTimestamp) {
         return sortedActions[sortedActions.length - 1].location;
      }

      let prevIndex = 0;
      while (
         prevIndex < sortedActions.length - 1 &&
         sortedActions[prevIndex + 1].timestamp <= currentTime
      ) {
         prevIndex++;
      }

      const prevAction = sortedActions[prevIndex];
      const nextAction = sortedActions[prevIndex + 1];

      if (!nextAction) return prevAction.location;

      // Normalized time between 0 and 1
      const normalizedTime = (currentTime - prevAction.timestamp) /
         (nextAction.timestamp - prevAction.timestamp);

      // Apply easing function for non-linear interpolation
      const easedTime = easeInOutCubic(normalizedTime);

      const interpolatedX = (prevAction.location?.x || 0) +
         easedTime *
            ((nextAction.location?.x || 0) - (prevAction.location?.x || 0));
      const interpolatedY = (prevAction.location?.y || 0) +
         easedTime *
            ((nextAction.location?.y || 0) - (prevAction.location?.y || 0));

      return {
         x: interpolatedX,
         y: interpolatedY,
         // Calculate rotation based on movement direction
         rotation: (Math.atan2(
            (nextAction.location?.y || 0) - (prevAction.location?.y || 0),
            (nextAction.location?.x || 0) - (prevAction.location?.x || 0),
         ) *
            180) /
            Math.PI,
      };
   };

   const currentPosition = getCurrentPosition();

   // Compute the robot’s trail (path drawn so far) using a Hermite spline.
   // We take all filtered actions (those that have happened) and append the current interpolated position.
   const currentPathData = useMemo(() => {
      if (filteredActions.length === 0 || !currentPosition) return "";
      const points = [
         ...filteredActions,
         {
            // Adding a pseudo-action to include the current interpolated position
            location: currentPosition,
            timestamp: currentTime,
            action: "current",
         },
      ];
      return computePath(
         points as (AutoAction<2025> | TeleopAction<2025>)[],
      );
   }, [filteredActions, currentPosition, currentTime]);

   // Animation handling for playing the timeline
   const [isPlaying, setIsPlaying] = useState(false);
   const [playbackSpeed, setPlaybackSpeed] = useState(4);

   useEffect(() => {
      let animationFrame: number;

      const animate = () => {
         if (isPlaying) {
            setCurrentTime((prevTime) => {
               const newTime = prevTime + (16 * (playbackSpeed / 2)); // Dynamic speed
               return newTime > endTimestamp ? startTimestamp : newTime;
            });
         }

         animationFrame = requestAnimationFrame(animate);
      };

      if (isPlaying) {
         animationFrame = requestAnimationFrame(animate);
      }

      return () => {
         if (animationFrame) {
            cancelAnimationFrame(animationFrame);
         }
      };
   }, [isPlaying, endTimestamp, startTimestamp, playbackSpeed]);

   const speedOptions = [1, 4, 8, 12];
   function changeSpeed() {
      const nextSpeed = speedOptions.findIndex((val) => val === playbackSpeed);
      setPlaybackSpeed(
         speedOptions[nextSpeed + 1 < speedOptions.length ? nextSpeed + 1 : 0],
      );
   }

   // Helpers to get coordinates
   function getRealX(point: AutoAction<2025> | TeleopAction<2025>) {
      return Math.abs(point.location?.x || 0);
   }

   function getRealY(point: AutoAction<2025> | TeleopAction<2025>) {
      return Math.abs(point.location?.y || 0);
   }

   const svgAspectRatio = matchData.alliance === "blue"
      ? "xMinYMid slice"
      : "xMaxYMid slice";

   // Calculate progress percentage for timeline
   const progressPercentage =
      ((currentTime - startTimestamp) / (endTimestamp - startTimestamp)) * 100;

   const [isExpanded, setIsExpanded] = useState<boolean>(false);

   return (
      <div className={styles.container}>
         {/* SVG Container */}
         <div className={styles.svgContainer} style={{ padding: `0rem` }}>
            <motion.div
               className={styles.displaySettings}
               initial={{ width: "6rem", height: "3rem" }}
               animate={{
                  width: isExpanded ? "13rem" : "6rem",
                  height: isExpanded ? "12rem" : "2.7rem",
               }}
               style={{
                  top: matchData.alliance === "red" ? "0.5rem" : "unset",
                  left: matchData.alliance === "red" ? "0.5rem" : "unset",
                  bottom: matchData.alliance === "blue" ? "0.5rem" : "unset",
                  right: matchData.alliance === "blue" ? "0.5rem" : "unset",
                  overflow: "hidden",
               }}
               transition={{ duration: 0.2 }}
            >
               <div className={styles.displaySettingsHeader}>
                  <div>
                     <i
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className={`fa-solid fa-${
                           isExpanded ? "compress" : "expand"
                        }`}
                        style={{ cursor: "pointer" }}
                     />
                  </div>
                  {new Date(currentTime - startTimestamp)
                     .toISOString()
                     .substr(14, 5)}
               </div>
               {isExpanded && (
                  <>
                     <div className={styles.displayMatchDetails}>
                        <div style={{ color: "var(--primary)" }}>Scouter</div>
                        {" "}
                        <div style={{ color: "var(--text-secondary)" }}>|</div>
                        <div
                           style={{
                              textAlign: "start",
                              width: "7rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                           }}
                        >
                           {matchData.name}
                        </div>
                     </div>
                     <div className={styles.displaySettingOption}>
                        Auto data{" "}
                        <Checkbox enabled={showAuto} setEnabled={setShowAuto} />
                     </div>
                     <div className={styles.displaySettingOption}>
                        Teleop data{" "}
                        <Checkbox
                           enabled={showTeleop}
                           setEnabled={setShowTeleop}
                        />
                     </div>
                     <div className={styles.displaySettingOption}>
                        Show labels{" "}
                        <Checkbox
                           enabled={showLabels}
                           setEnabled={setShowLabels}
                        />
                     </div>
                  </>
               )}
            </motion.div>
            <svg
               viewBox="0 0 1000 500"
               preserveAspectRatio={svgAspectRatio}
               className={styles.svg}
            >
               {/* Field Map */}
               <image
                  href="/app/field/2025field.svg"
                  x="0"
                  y="0"
                  width="1000"
                  height="500"
               />
               {currentPathData && (
                  <path
                     d={currentPathData}
                     stroke="#FFFFFF0F"
                     strokeWidth="8"
                     fill="none"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               )}

               {/* Render action points */}
               {filteredActions.map((point, index) => {
                  const cx = getRealX(point);
                  const cy = getRealY(point);
                  const fillColor = colorMap[point.action] || defaultColor;
                  return (
                     <Tippy content={point.action} key={index}>
                        <g>
                           <circle cx={cx} cy={cy} r={20} fill={fillColor} />
                           {showLabels && (
                              <g
                                 transform={`translate(${cx + 22}, ${cy - 14})`}
                              >
                                 <rect
                                    x={0}
                                    y={0}
                                    width={point.action.length * 10 + 20}
                                    height={28}
                                    fill={fillColor}
                                    rx={4}
                                    ry={4}
                                 />
                                 <text
                                    x={6}
                                    y={20}
                                    fill="var(--text-background)"
                                    fontSize="20"
                                    fontFamily="Outfit"
                                 >
                                    {point.action}
                                 </text>
                              </g>
                           )}
                        </g>
                     </Tippy>
                  );
               })}

               {/* Robot Marker */}
               {currentPosition && (
                  <g
                     transform={`translate(${currentPosition.x}, ${currentPosition.y}) rotate(${
                        (currentPosition as { rotation: number })?.rotation || 0
                     })`}
                  >
                     <rect
                        x="-24"
                        y="-24"
                        width="48"
                        height="48"
                        rx="8"
                        ry="8"
                        fill="var(--primary-dark)"
                        stroke="var(--primary)"
                        strokeWidth={2}
                     />
                     <path
                        d="M 7.5 0 L -3.75 6.5 L -3.75 -6.5 Z"
                        fill="var(--primary)"
                        strokeLinejoin="round"
                        stroke="var(--primary)"
                        strokeWidth="3"
                     />
                  </g>
               )}
            </svg>
         </div>

         {/* Vertical Controls */}
         <div className={styles.verticalControls}>
            {/* Play/Pause Button */}
            <button
               onClick={() => setIsPlaying(!isPlaying)}
               className={styles.playPauseButton}
            >
               <i className={`fa-solid fa-${isPlaying ? "pause" : "play"}`} />
            </button>

            {/* Vertical Timeline */}
            <div className={styles.timelineContainer}>
               {/* Background timeline */}
               <div className={styles.timelineBackground} />
               {/* Progress indicator */}
               <div
                  className={styles.timelineProgress}
                  style={{
                     height: `${
                        progressPercentage > 100 ? 100 : progressPercentage
                     }%`,
                  }}
               />
               <input
                  type="range"
                  min={startTimestamp}
                  max={endTimestamp}
                  value={currentTime}
                  onChange={(e) => {
                     setCurrentTime(Number(e.target.value));
                     setIsPlaying(false);
                  }}
                  className={styles.timelineInput}
                  style={{
                     transform: `translateY(-50%) rotate(90deg) scaleX(-1)`,
                     transformOrigin: "left center",
                  }}
               />
            </div>

            {/* Speed Controls */}
            <div className={styles.speedControls}>
               <button onClick={changeSpeed} className={styles.speedButton}>
                  {playbackSpeed}x
               </button>
            </div>
         </div>
      </div>
   );
}

export default MatchReplayFieldMap;
