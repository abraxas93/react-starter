import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createAppQueryClient } from "#/app/di/query-client";
import { createAppRouter } from "#/app/di/router";
import { ThemeProvider } from "#/app/providers/theme-provider";
import "./styles.css";

const queryClient = createAppQueryClient();
const router = createAppRouter();
const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Application root element was not found");

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>,
);
