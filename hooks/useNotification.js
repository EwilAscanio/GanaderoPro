"use client";

import { useState, useCallback } from "react";

export function useNotification() {
  const [state, setState] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "",
  });

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const show = useCallback((opts = {}) => {
    setState({
      isOpen: true,
      type: opts.type || "info",
      title: opts.title || "",
      message: opts.message || "",
      onConfirm: opts.onConfirm || null,
      confirmText: opts.confirmText || "",
    });
  }, []);

  const success = useCallback(
    (message, title) => show({ type: "success", title, message }),
    [show]
  );

  const error = useCallback(
    (message, title) => show({ type: "error", title, message }),
    [show]
  );

  const warning = useCallback(
    (message, title) => show({ type: "warning", title, message }),
    [show]
  );

  const info = useCallback(
    (message, title) => show({ type: "info", title, message }),
    [show]
  );

  const confirm = useCallback(
    (opts = {}) => show({ type: "confirm", ...opts }),
    [show]
  );

  const deleteConfirm = useCallback(
    (opts = {}) => show({ type: "delete", ...opts }),
    [show]
  );

  return {
    notification: {
      ...state,
      onClose: close,
    },
    show,
    close,
    success,
    error,
    warning,
    info,
    confirm,
    deleteConfirm,
  };
}
