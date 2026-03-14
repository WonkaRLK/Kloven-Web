"use client";

import { useSpinWheel } from "./useSpinWheel";
import SpinWheelModal from "./SpinWheelModal";
import SpinWheelButton from "./SpinWheelButton";

export default function SpinWheelContainer() {
  const {
    isModalOpen,
    phase,
    email,
    setEmail,
    spinning,
    rotation,
    result,
    error,
    loading,
    copied,
    openModal,
    closeModal,
    spin,
    copyCode,
  } = useSpinWheel();

  return (
    <>
      <SpinWheelButton onClick={openModal} hasCode={!!result?.code} />
      <SpinWheelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        phase={phase}
        email={email}
        onEmailChange={setEmail}
        onSpin={spin}
        spinning={spinning}
        rotation={rotation}
        result={result}
        error={error}
        loading={loading}
        copied={copied}
        onCopy={copyCode}
      />
    </>
  );
}
