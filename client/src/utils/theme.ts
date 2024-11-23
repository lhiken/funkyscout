const setTheme = (theme: string) => {
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

   if (theme) {
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

export { setTheme, updateTheme };
