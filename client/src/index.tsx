import { render } from 'preact';

import { BlueprintProvider } from "@blueprintjs/core";

import BiPanel from './components/layout/bipanel/bipanel';
import { useEffect, useState } from 'preact/hooks';
import Axios from 'axios-observable';
import { map } from 'rxjs';
import PossibleYardage from './components/bespoke/possible-yardage/possible-yardage';
import PossibleYardageProvider from './components/bespoke/possible-yardage/possible-yardage-provider';

export const App = () =>{
	const g1 = '2024090500';
	const g2 = '2024090800';
	const g3 = '2024090805';
	const g4 = '2024092301';
	const g5 = '2024092207';

	return <BlueprintProvider>
        <div>My app has overlays, hotkeys, and portal customization 😎</div>
		<BiPanel>
			<h1>Tools</h1>
			<div>
				<p>Content goes here</p>
				<PossibleYardageProvider gameid={g1}/>
				<PossibleYardageProvider gameid={g2}/>
				<PossibleYardageProvider gameid={g3}/>
				<PossibleYardageProvider gameid={g4}/>
				<PossibleYardageProvider gameid={g5}/>
			</div>
			
		</BiPanel>
    </BlueprintProvider>

}

render(<App />, document.getElementById('app'));
