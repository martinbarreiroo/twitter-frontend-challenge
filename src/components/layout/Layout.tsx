import React from "react";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "styled-components";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import global_en from "../../translations/en/global.json";
import global_es from "../../translations/es/global.json";
import { store } from "../../redux/store";
import { queryClient } from "../../lib/react-query";
import { LightTheme } from "../../util/LightTheme";
import { ROUTER } from "./Router";
import { AuthProvider } from "../../contexts/AuthContext";

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: "en",
  resources: {
    en: {
      translation: global_en,
    },
    es: {
      translation: global_es,
    },
  },
  fallbackLng: "en",
});

export const Layout = () => {
  return (
    <I18nextProvider i18n={i18next}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={LightTheme}>
            <AuthProvider>
              <RouterProvider router={ROUTER} />
            </AuthProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </I18nextProvider>
  );
};
