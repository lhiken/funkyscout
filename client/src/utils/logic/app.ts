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

export { handleEventChange, getEvent };
