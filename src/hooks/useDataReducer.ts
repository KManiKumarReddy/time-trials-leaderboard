import { useReducer, useCallback } from "react";
import { AppData, Entry, Edition, Runner, Config } from "../types";

type Action =
  | { type: "SET_DATA"; payload: AppData }
  | { type: "UPDATE_CONFIG"; payload: Partial<Config> }
  | { type: "ADD_EDITION"; payload: Edition }
  | { type: "UPDATE_EDITION"; id: string; field: keyof Edition; value: any }
  | { type: "DELETE_EDITION"; id: string }
  | { type: "ADD_ENTRY"; payload: Entry }
  | { type: "UPDATE_ENTRY"; id: string; field: keyof Entry; value: any }
  | { type: "DELETE_ENTRY"; id: string }
  | { type: "ADD_RUNNER"; payload: Runner }
  | { type: "UNDO" }
  | { type: "REDO" };

interface State {
  past: AppData[];
  present: AppData | null;
  future: AppData[];
}

function reducer(state: State, action: Action): State {
  const { past, present, future } = state;

  if (action.type === "SET_DATA") {
    return { past: [], present: action.payload, future: [] };
  }

  if (!present) return state;

  if (action.type === "UNDO") {
    if (past.length === 0) return state;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    return {
      past: newPast,
      present: previous,
      future: [present, ...future],
    };
  }

  if (action.type === "REDO") {
    if (future.length === 0) return state;
    const next = future[0];
    const newFuture = future.slice(1);
    return {
      past: [...past, present],
      present: next,
      future: newFuture,
    };
  }

  // Create new specialized state based on action
  const newPresent = { ...present };

  switch (action.type) {
    case "UPDATE_CONFIG":
      newPresent.config = { ...newPresent.config, ...action.payload };
      break;
    case "ADD_EDITION":
      newPresent.editions = [...newPresent.editions, action.payload];
      break;
    case "UPDATE_EDITION":
      newPresent.editions = newPresent.editions.map((ed: Edition) =>
        ed.id === action.id ? { ...ed, [action.field]: action.value } : ed,
      );
      break;
    case "DELETE_EDITION":
      newPresent.editions = newPresent.editions.filter(
        (ed: Edition) => ed.id !== action.id,
      );
      newPresent.entries = newPresent.entries.filter(
        (ent: Entry) => ent.editionId !== action.id,
      );
      break;
    case "ADD_ENTRY":
      newPresent.entries = [action.payload, ...newPresent.entries];
      break;
    case "UPDATE_ENTRY":
      newPresent.entries = newPresent.entries.map((ent: Entry) =>
        ent.id === action.id ? { ...ent, [action.field]: action.value } : ent,
      );
      break;
    case "DELETE_ENTRY":
      newPresent.entries = newPresent.entries.filter(
        (ent: Entry) => ent.id !== action.id,
      );
      break;
    case "ADD_RUNNER":
      newPresent.runners = [...newPresent.runners, action.payload];
      break;
    default:
      return state;
  }

  return {
    past: [...past, present],
    present: newPresent,
    future: [],
  };
}

export function useDataReducer(initialData: AppData | null) {
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    present: initialData,
    future: [],
  });

  const setData = useCallback(
    (data: AppData) => dispatch({ type: "SET_DATA", payload: data }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  return {
    data: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    dispatch,
    setData,
    undo,
    redo,
  };
}
