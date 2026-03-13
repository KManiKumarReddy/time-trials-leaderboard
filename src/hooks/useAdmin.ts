import { useState, useMemo, useEffect } from "react";
import CryptoJS from "crypto-js";
import { AppData, Edition, Entry, Gender } from "../types";
import { useDataReducer } from "./useDataReducer";
import { updateStats } from "../api/github";

export function useAdmin(
  data: AppData,
  onLocalDataUpdate: (newData: AppData) => void,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedEdition, setExpandedEdition] = useState<string | null>(null);

  // Auth Logic
  const [isLocked, setIsLocked] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reducer for complex state
  const {
    data: localData,
    canUndo,
    undo,
    dispatch,
    setData,
  } = useDataReducer(data);

  useEffect(() => {
    if (
      data &&
      localData &&
      JSON.stringify(data) === JSON.stringify(localData)
    ) {
      setData(data);
    }
  }, [data, setData, localData]);

  const isDirty = useMemo(() => {
    return (
      data && localData && JSON.stringify(data) !== JSON.stringify(localData)
    );
  }, [data, localData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const handlePopState = () => {
      if (isDirty) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        );
        if (!confirmLeave) {
          // Push back to current state to prevent navigation
          window.history.pushState(null, "", window.location.href);
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  const handleUnlock = (pwd: string) => {
    setIsVerifying(true);
    setAuthError(null);
    try {
      const encryptedPat = import.meta.env.VITE_ENCRYPTED_PAT;
      const bytes = CryptoJS.AES.decrypt(encryptedPat, pwd);
      const decryptedPat = bytes.toString(CryptoJS.enc.Utf8);

      if (decryptedPat && decryptedPat.length > 10) {
        setAdminPassword(pwd);
        setIsLocked(false);
      } else {
        throw new Error("Incorrect password.");
      }
    } catch {
      setAuthError("Authentication failed. Please check your password.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePublish = async () => {
    if (!localData) return;
    setIsSaving(true);
    setModalError(null);
    try {
      const encryptedPat = import.meta.env.VITE_ENCRYPTED_PAT;
      const bytes = CryptoJS.AES.decrypt(encryptedPat, adminPassword);
      const decryptedPat = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedPat || decryptedPat.length < 10) {
        throw new Error("Verification failed. Session expired?");
      }

      await updateStats(decryptedPat, localData);
      onLocalDataUpdate(localData);
      setMsg({ type: "success", text: "Changes published successfully!" });
      setShowModal(false);
      setTimeout(() => setMsg(null), 5000);
    } catch (err: any) {
      setModalError(err.message || "Publish failed.");
      if (err.message.includes("Verification")) {
        setIsLocked(true);
        setAdminPassword("");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      dispatch({
        type: "UPDATE_CONFIG",
        payload: {
          [parent]: { ...(localData?.config as any)[parent], [child]: value },
        },
      });
    } else {
      dispatch({ type: "UPDATE_CONFIG", payload: { [name]: value } });
    }
  };

  const handleAddEdition = () => {
    if (!localData) return;
    const newId = `ed_${Date.now()}`;
    const nextNum =
      localData.editions.length > 0
        ? Math.max(...localData.editions.map((e) => e.num)) + 1
        : 1;
    dispatch({
      type: "ADD_EDITION",
      payload: {
        id: newId,
        num: nextNum,
        date: new Date().toISOString().split("T")[0],
        location: localData.config.location || "",
      } as Edition,
    });
    setExpandedEdition(newId);
  };

  return {
    localData,
    isDirty,
    canUndo,
    undo,
    isLocked,
    isVerifying,
    authError,
    handleUnlock,
    showModal,
    setShowModal,
    isSaving,
    modalError,
    handlePublish,
    msg,
    expandedEdition,
    setExpandedEdition,
    handleConfigChange,
    handleAddEdition,
    dispatch,
  };
}
