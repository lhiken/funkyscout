type theme = "theme-dark" | "theme-light";

const setTheme = (theme: theme) => {
   localStorage.setItem("current_theme", theme);
   document.documentElement.className = theme;

   const themeColorMeta = document.querySelector('meta[name="theme-color"]');
   if (themeColorMeta) {
      if (theme === "theme-dark") {
         themeColorMeta.setAttribute("content", "#121212");
      } else {
         themeColorMeta.setAttribute("content", "#F7F7F7");
      }
   }
};

const updateTheme = () => {
   const theme = localStorage.getItem("current_theme");

   if (theme == "theme-dark" || theme == "theme-light") {
      setTheme(theme);
   } else {
      const prefersDarkScheme =
         window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDarkScheme) {
         setTheme("theme-dark");
      } else {
         setTheme("theme-light");
      }
   }
};

const toggleTheme = () => {
   const theme = localStorage.getItem("current_theme");

   if (theme == "theme-dark") {
      setTheme("theme-light");
   } else {
      setTheme("theme-dark");
   }
};

export { setTheme, toggleTheme, updateTheme };
