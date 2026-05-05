import { useState } from "react";

export default function useSubmitConfirmation() {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] =
    useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  function requestConfirmation(action) {
    if (isSubmittingConfirmation) {
      return;
    }

    setPendingAction(() => action);
    setIsConfirmationOpen(true);
  }

  function closeConfirmation() {
    if (isSubmittingConfirmation) {
      return;
    }

    setIsConfirmationOpen(false);
    setPendingAction(null);
  }

  async function confirmSubmission() {
    if (!pendingAction || isSubmittingConfirmation) {
      return;
    }

    const action = pendingAction;
    setIsConfirmationOpen(false);
    setPendingAction(null);
    setIsSubmittingConfirmation(true);

    try {
      await action();
    } finally {
      setIsSubmittingConfirmation(false);
    }
  }

  return {
    isConfirmationOpen,
    isSubmittingConfirmation,
    requestConfirmation,
    closeConfirmation,
    confirmSubmission,
  };
}
