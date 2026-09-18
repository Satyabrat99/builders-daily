"use client";
import { useEffect, useRef, useState } from "react";

/**
 * GistEmbed - React 19 compatible GitHub Gist embed
 * Replaces the abandoned react-gist package (React <=17 only).
 * Uses GitHub's .pibb plain HTML endpoint inside an auto-sizing iframe.
 */
export default function GistEmbed({ id }) {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(300);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      try {
        const body = iframe.contentDocument?.body;
        if (body) setHeight(body.scrollHeight + 24);
      } catch {
        // cross-origin safety — keep default height
      }
    };

    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [id]);

  return (
    <iframe
      ref={iframeRef}
      src={`https://gist.github.com/${id}.pibb`}
      style={{
        width: "100%",
        height: `${height}px`,
        border: "none",
        borderRadius: "6px",
        display: "block",
      }}
      title={`GitHub Gist ${id}`}
      loading="lazy"
    />
  );
}
