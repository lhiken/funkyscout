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

export { getEvent, getFocusTeam, handleEventChange, setFocusTeam };
