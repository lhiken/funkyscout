function handleEventChange(event: string) {
   const oldEvent = localStorage.getItem("event");

   localStorage.setItem("event", event);

   return oldEvent;
}

export { handleEventChange };
