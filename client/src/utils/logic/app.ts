import { TeamMetrics } from "../../schemas/schema";

function handleEventChange(event: string) {
   const oldEvent = localStorage.getItem("event");

   localStorage.setItem("event", event);

   return oldEvent;
}

function getEvent() {
   const event = localStorage.getItem("event");

   if (!event) {
      return;
   }

   return event;
}

function getEventYear(): keyof TeamMetrics {
   const event = getEvent();
   if (event) {
      return Number(event.substring(3)) as keyof TeamMetrics;
   } else {
      return 0 as keyof TeamMetrics;
   }
}

function setFocusTeam(team: string) {
   const oldTeam = localStorage.getItem("focusTeam");

   localStorage.setItem("focusTeam", team);

   return oldTeam;
}

function getFocusTeam() {
   const team = localStorage.getItem("focusTeam");

   if (!team) {
      return;
   }

   return team;
}

/**
 * Takes in a match key such as 2024casf_qm23 and
 * converts it to a more readable version such as
 * "Qualfication 23."
 *
 * Nexus will return the Nexus format match key,
 * while short returns a shortened version, such
 * as "Qual 23." Long includes the event key, so
 * "2024casf Qual 23"
 *
 * @param key
 * @param mode
 * @returns string such as "Qualification"
 */
function parseMatchKey(
   key: string,
   mode: "nexus" | "short" | "long" | "number",
) {
   let returnKey = "";

   if (mode == "number") return key.substring(key.indexOf("_") + 2);

   if (mode == "long") returnKey += key.substring(0, key.indexOf("_")) + " ";

   if (mode == "nexus") {
      key = key.substring(key.indexOf("_") + 1);
      if (key.substring(0, 2) == "qm") {
         returnKey += `Qualification ${key.substring(2)}`;
      }
      if (key.substring(0, 2) == "sf") {
         returnKey += `Semifinals ${key.substring(2, key.indexOf("m"))}`;
      }
      if (key.substring(0, 1) == "f") {
         returnKey += `Finals ${key.substring(1, key.indexOf("m"))}`;
      }
   } else {
      key = key.substring(key.indexOf("_") + 1);
      if (key.substring(0, 2) == "qm") {
         returnKey += `Qual ${key.substring(2)}`;
      }
      if (key.substring(0, 2) == "sf") {
         returnKey += `Elims ${key.substring(2, key.indexOf("m"))}`;
      }
      if (key.substring(0, 1) == "f") {
         returnKey += `Finals ${key.substring(1, key.indexOf("m"))}`;
      }
   }

   return returnKey;
}

function parseTeamKey(key: string) {
   if (key.substring(0, 3) == "frc") {
      return key.substring(3);
   } else {
      return key;
   }
}

export {
   getEvent,
   getEventYear,
   getFocusTeam,
   handleEventChange,
   parseMatchKey,
   parseTeamKey,
   setFocusTeam,
};
