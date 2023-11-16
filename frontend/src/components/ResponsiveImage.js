import React from "react";

export default function ResponsiveImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "auto",
        height: "100%", // Ajusté pour occuper la hauteur complète
        maxHeight: "50px",
        objectFit: "cover", // Garantit que l'image couvre l'espace sans se déformer
      }}
    />
  );
}
