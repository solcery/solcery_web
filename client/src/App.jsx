import React from "react-dom";
import { TopMenu } from "./components/TopMenu";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BrickLibraryProvider } from "./contexts/brickLibrary";
import { UserProvider } from "./contexts/user";
import { CookiesProvider } from "react-cookie";
import "./App.less";
import "./App.css";

import ObjectPage from "./apps/objectPage";
import TemplatePage from "./apps/templatePage";
import ContentExporter from "./apps/contentExporter";
import {
  BrickLibraryObjectEditor,
  BrickLibraryCollectionEditor,
} from "./apps/brickLibrary";
import Play from "./apps/play";
import Project from "./apps/project";
import Profile from "./apps/profile";
import TemplateSchema from "./apps/templateSchema";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <CookiesProvider>
          <UserProvider>
            <BrickLibraryProvider>
              <TopMenu style={{ backgroundColor: "black" }} />
              <Routes>
                <Route
                  path="template.:templateCode.schema"
                  element={<TemplateSchema />}
                />
                <Route
                  path="template.:templateCode.:objectId"
                  element={<ObjectPage />}
                />
                <Route
                  path="template.:templateCode"
                  element={<TemplatePage />}
                />
                <Route
                  path="brickLibrary"
                  element={<BrickLibraryCollectionEditor />}
                />
                <Route
                  path="brickLibrary.:objectId"
                  element={<BrickLibraryObjectEditor />}
                />
                <Route path="play" element={<Play />} />
                <Route path="project" element={<Project />} />
                <Route path="export" element={<ContentExporter />} />
                <Route path="profile" element={<Profile />} />
              </Routes>
            </BrickLibraryProvider>
          </UserProvider>
        </CookiesProvider>
      </BrowserRouter>
    </>
  );
}
