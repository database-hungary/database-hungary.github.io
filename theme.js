if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    useTheme("dark");
} else {
    useTheme("light");
}

function useTheme(theme) {
    var link = document.createElement("link");
      link.href = `style.${theme}.css`;
      link.type = "text/css";
      link.rel = "stylesheet";
      document.getElementsByTagName("head")[0].appendChild(link);
}