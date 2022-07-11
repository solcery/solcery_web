import React from 'react-dom';
import { BrowserRouter, Routes, Route, Switch } from 'react-router-dom';
import { ProjectProvider } from '../../contexts/project';
import { TemplateProvider } from '../../contexts/template';
import { ObjectProvider } from '../../contexts/object';
import { TopMenu } from '../../components/TopMenu';
import { CookiesProvider } from 'react-cookie';
import './Sage.less';
import './Sage.css';

import ObjectPage from '../../apps/objectPage';
import TemplatePage from '../../apps/templatePage';
import ContentExporter from '../../apps/contentExporter';
import ContentImporter from '../../apps/contentImporter';
import Migrator from '../../apps/migrator';
import { BrickLibraryObjectEditor, BrickLibraryCollectionEditor } from '../../apps/brickLibrary';
import Play from '../../apps/play';
import Builder from '../../apps/builder';
import Profile from '../../apps/profile';
import ApiLogs from '../../apps/apiLogs';
import TemplateSchema from '../../apps/templateSchema';
import BrickEditor from '../../apps/brickEditor';

export default function Sage() {
	return (
		<>
			<CookiesProvider>
				<BrowserRouter>
					<Routes>
						<Route path=":projectName" element={<ProjectProvider />}>
							<Route path="" element={<TopMenu style={{ backgroundColor: 'black' }} />}>
								<Route path='template'>
									<Route path=':templateCode' element={<TemplateProvider/> }>
										<Route exact path="schema" element={<TemplateSchema />} />
										<Route path=":objectId" element={<ObjectProvider />}>
											<Route exact path='' element={<ObjectPage />}/>
											<Route path=":brickPath" element={<BrickEditor/>} />
										</Route>	
										<Route exact path='' element={<TemplatePage />}/>
									</Route>
								</Route>
								<Route path="brickLibrary" element={<BrickLibraryCollectionEditor />} />
								<Route path="brickLibrary.:objectId" element={<BrickLibraryObjectEditor />} />
								<Route path="play" element={<Play />} />
								<Route path="apiLogs" element={<ApiLogs />} />
								<Route path="builder" element={<Builder />} />
								<Route path="migrator" element={<Migrator />} />
								<Route path="export" element={<ContentExporter />} />
								<Route path="import" element={<ContentImporter />} />
								<Route path="profile" element={<Profile />} />
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</CookiesProvider>
		</>
	);
}
