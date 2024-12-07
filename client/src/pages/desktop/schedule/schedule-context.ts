import { createContext, Dispatch, SetStateAction } from "react";
import { AssignmentData, ScheduleContextType } from "./schedule";

export const ScheduleContext = createContext<{
   val?: ScheduleContextType;
   setVal?: Dispatch<SetStateAction<ScheduleContextType>>;
}>({});

export const AssignmentContext = createContext<{
   val?: AssignmentData;
   setVal?: Dispatch<SetStateAction<AssignmentData>>;
}>({});
