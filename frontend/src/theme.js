import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    // Utilisez une couleur primaire qui s'harmonise avec le bleu de votre dégradé
    primary: {
      main: "rgba(34, 193, 195, 1)", // Bleu semblable à votre gradient
      contrastText: "#fff", // Texte blanc pour une bonne lisibilité
    },
    // Utilisez une couleur secondaire qui s'harmonise avec l'orange de votre dégradé
    secondary: {
      main: "rgba(253, 187, 45, 1)", // Orange semblable à votre gradient
      contrastText: "#fff", // Texte blanc pour une bonne lisibilité
    },
    text: {
      primary: "rgba(255,255,255,0.87)",
    },
    // Configurez les autres éléments de couleur selon vos préférences
    // ...
  },
  // Vous pouvez également personnaliser d'autres aspects du thème ici
  // ...
});

export default theme;
