import { useState } from "react";
import { motion } from "motion/react";
import { Dispatch, SetStateAction } from "react";
import styles from "./user-settings.module.css";
import { getLocalUserData } from "../../../lib/supabase/auth";
import InvitationCard from "../../../components/app/user-settings/invitation-card";
import UsernameChangeCard from "../../../components/app/user-settings/username-card";
import { setFocusTeam } from "../../../utils/logic/app"; // Importing the focus logic
import PicklistBarGraph from "../picklists/comparison-box/graphs/bar";

function UserSettings({
  setShowSettings,
}: {
  setShowSettings: Dispatch<SetStateAction<boolean>>;
}) {
  const [teamKey, setTeamKey] = useState<string>("");
  const [focusTeam, setFocusTeamState] = useState<string | null>(null);

  // Handle focus team change when the user inputs a team key
  const handleFocusTeam = () => {
    if (teamKey.trim() !== "") {
      setFocusTeamState(teamKey); // Update the state with the new focus team
      setFocusTeam(teamKey); // Set the focus team in localStorage or similar (if needed)
      alert(`Focused on team: ${teamKey}`);
    } else {
      setFocusTeamState(""); // Reset focus if input is empty
      setFocusTeam(""); // Reset in localStorage
      alert("Focus reset.");
    }
  };

  // Example valueObject to demonstrate the bar graph
  const valueObject = [
    { teamKey: "team1", value: 10 },
    { teamKey: "team2", value: 20 },
    { teamKey: "team3", value: 30 },
  ];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={styles.userSettingsContainer}
    >
      <div className={styles.userSettingsHeader}>
        User settings
        <div
          onClick={() => setShowSettings(false)}
          style={{ fontSize: "1.1rem" }}
        >
          <i
            className="fa-regular fa-circle-xmark"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
      <div style={{ color: "var(--text-secondary)", height: "0.5rem" }}>
        {getLocalUserData().email}
      </div>
      <div className={styles.seperator} />
      <UsernameChangeCard />
      <div className={styles.seperator} />
      <InvitationCard />
      <div className={styles.seperator} />

      {/* Focus Team Section */}
      <div className={styles.focusTeamSection}>
        <div className={styles.sectionHeader}>Set Focus on Team</div>
        <input
          type="text"
          placeholder="Enter team key"
          value={teamKey}
          onChange={(e) => setTeamKey(e.target.value)}
          className={styles.teamInput}
        />
        <button onClick={handleFocusTeam} className={styles.focusButton}>
          Set Focus
        </button>
      </div>

      {/* Render PicklistBarGraph and pass the focusTeam prop */}
      <PicklistBarGraph
        valueObject={valueObject}
        indexByKey="teamKey"
        keysOfSeries={["value"]}
        axisTicks={5}
        focusTeam={focusTeam} // Pass the focused team key here
      />
    </motion.div>
  );
}

export default UserSettings;
