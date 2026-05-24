"use client";

import { useEffect, useState } from "react";

type PopupState = {
  visible: boolean;
  x: number;
  y: number;
  text: string;
  translated: string;
};

export default function SelectionTranslator() {
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    x: 0,
    y: 0,
    text: "",
    translated: "",
  });

  useEffect(() => {
    function handleSelection() {
      const selection = window.getSelection();

      if (!selection || selection.toString().trim() === "") {
        return;
      }

      const text = selection.toString().trim();

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setPopup({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        text,
        translated: "",
      });
    }

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, []);

  async function translate() {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: popup.text,
      }),
    });

    const data = await res.json();

    setPopup((prev) => ({
      ...prev,
      translated: data.translated,
    }));
  }

  if (!popup.visible) return null;

  return (
    <>
      {/* Translate button */}
      <div
        className="fixed z-50"
        style={{
          left: popup.x,
          top: popup.y,
          transform: "translate(-50%, -100%)",
        }}
      >
        {!popup.translated ? (
          <button
            onClick={translate}
            className="rounded-full bg-blue-500 px-3 py-1 text-sm text-white shadow-lg"
          >
            Translate
          </button>
        ) : (
          <div className="max-w-sm rounded-xl bg-black p-3 text-sm text-white shadow-2xl">
            {popup.translated}
          </div>
        )}
      </div>

      {/* Click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={() =>
          setPopup({
            visible: false,
            x: 0,
            y: 0,
            text: "",
            translated: "",
          })
        }
      />
    </>
  );
}