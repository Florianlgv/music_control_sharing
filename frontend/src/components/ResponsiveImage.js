import React from "react";

export default function ResponsiveImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "auto",
        height: "100%",
        maxHeight: "50px",
        objectFit: "cover",
      }}
    />
  );
}
