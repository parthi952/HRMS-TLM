import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ThemeProvider } from "./ThemeContext";
import { UserProvider } from "./Context/UserContext";
import { UserDataProvider } from "./Context/UserData";
import { TaskProvider } from "./Context/TaskContext";
import { PayrollProvider } from "./Context/PayrollContext";

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <UserDataProvider>
          <TaskProvider>
            <PayrollProvider>
              <div className="flex flex-col h-screen">
                {/* Pages */}
                <div className="flex-1">
                  <RouterProvider router={router} />
                </div>
              </div>
            </PayrollProvider>
          </TaskProvider>
        </UserDataProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;