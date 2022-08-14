import React from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HotkeyProvider } from '../../contexts/hotkey';
import { ProjectProvider } from '../../contexts/project';
import { TemplateProvider } from '../../contexts/template';
import { ObjectDocProvider } from '../../contexts/objectDocRoute';
import { TopMenu } from '../../components/TopMenu';
import { CookiesProvider } from 'react-cookie';
import './Sage.less';
import './Sage.css';

import { ObjectPage } from '../../apps/object';
import { TemplatePage, TemplateSchema } from '../../apps/template';
import { ContentExporter, ContentImporter } from '../../apps/sync';
import Migrator from '../../apps/migrator';
import PlayPage from '../../apps/playPage';
import Builder from '../../apps/builder';
import Profile from '../../apps/profile';
import Home from '../../apps/home';
import Validator from '../../apps/validator';
import ApiLogs from '../../apps/apiLogs';
import ProjectConfig from '../../apps/projectConfig';
import BrickEditor from '../../apps/brickEditor';

export default function Sage() {
	return (
		<>
			<CookiesProvider>
				<HotkeyProvider>
					<BrowserRouter>
						<Routes>
							<Route path=":projectId" element={<ProjectProvider />}>
								<Route path="" element={<TopMenu style={{ backgroundColor: 'black' }} />}>
									<Route path="template">
										<Route path=":templateCode" element={<TemplateProvider />}>
											<Route exact path="schema" element={<TemplateSchema />} />
											<Route path=":objectId" element={<ObjectDocProvider />}>
												<Route exact path="" element={<ObjectPage />} />
												<Route path=":brickPath" element={<BrickEditor />} />
											</Route>
											<Route exact path="" element={<TemplatePage />} />
										</Route>
									</Route>
									<Route path="play" element={<PlayPage />} />
									<Route path="apiLogs" element={<ApiLogs />} />
									<Route path="builder" element={<Builder />} />
									<Route path="migrator" element={<Migrator />} />
									<Route path="export" element={<ContentExporter />} />
									<Route path="import" element={<ContentImporter />} />
									<Route path="profile" element={<Profile />} />
									<Route path="config" element={<ProjectConfig />} />
									<Route path="validator" element={<Validator/>} />
									<Route exact path="" element={<Home/>} />
								</Route>
							</Route>
						</Routes>
					</BrowserRouter>
				</HotkeyProvider>
			</CookiesProvider>
		</>
	);
}
