import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../components/layout/protected-route";
import { AuthPage } from "../features/auth/routes/auth-page";
import { DashboardPage } from "../routes/dashboard-page";
import { RootLayout } from "./layouts/root-layout";
import { SpacePage } from "../routes/space-page";
import { SubjectPage } from "../routes/subject-page";
import { TopicPage } from "../routes/topic-page";

export const router = createBrowserRouter([
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/signup", element: <AuthPage mode="signup" /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "space/:spaceId", element: <SpacePage /> },
      { path: "subject/:subjectId", element: <SubjectPage /> },
      { path: "topic/:topicId", element: <TopicPage /> },
    ],
  },
]);