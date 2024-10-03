import { useEffect, useState } from "preact/hooks"
import PossibleYardage from "./possible-yardage"
import Axios from "axios-observable";
import { map } from "rxjs";

const PossibleYardageProvider = ({gameid})=>{
    const [data,setData] = useState([]);

    useEffect(()=>{
        Axios.get(`http://localhost:8000/summaries/${gameid}/drive_summary`).pipe(
			map(result=>result.data)
		).subscribe((gamedata)=>{
			setData(gamedata);
		});
    },[]);

    return <PossibleYardage data={data} width={500} height={500} />
}

export default PossibleYardageProvider;