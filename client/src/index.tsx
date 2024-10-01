import { render } from 'preact';

import { BlueprintProvider } from "@blueprintjs/core";

import BiPanel from './components/layout/bipanel/bipanel';
import { useEffect, useState } from 'preact/hooks';
import Axios from 'axios-observable';
import { map } from 'rxjs';
import PossibleYardage from './components/bespoke/possible-yardage/possible-yardage';

export const App = () =>{
	const [data,setData] = useState([]);
	useEffect(()=>{
		Axios.get('http://localhost:8000/summaries/2024090500/drive_summary').pipe(
			map(result=>result.data)
		).subscribe((gamedata)=>{
			console.log(gamedata);
			setData(gamedata);
		});
	},[])
	return <BlueprintProvider>
        <div>My app has overlays, hotkeys, and portal customization 😎</div>
		<BiPanel>
			<h1>Tools</h1>
			<div>
				<p>Content goes here</p>
				<PossibleYardage data={data} width={500} height={500} />
			</div>
			
		</BiPanel>
    </BlueprintProvider>

}

render(<App />, document.getElementById('app'));
