import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {PossibleYardageDriveRecord} from '../../../types/possible-yards'
import { axisBottom, axisLeft, scaleLinear, select, Series, stack, Selection, Stack, scaleBand, interpolateRgbBasis, rgb } from 'd3';
import { computeDimensions, computeStackMinMax, FigureDimensions, setMarginArea, setPlotArea, setSVG, SvgSelection } from '../../dataviz/utils';
import { PlotAxis } from '../../dataviz/types/axes';

import '../../../styles/nfl.scss';

/*
- stacked bar plot of earned vs. possible yardage
- vertically oriented - each bar goes up and down
- two teams arrange symmetrically about the horizontal axis

Usage:
- view the results of a single game (split by drive)
<PossibleYardage data={gameData} groupby="drive" />

- view the aggregate game results (split by team)
<PossibleYardage data={seasonData} groupby="team" />

- view the aggregate game result for a given team (split by year)
<PossibleYardage data={franchiseData} groupby="year"

*/

interface AmendedPossibleYardageRecord extends PossibleYardageDriveRecord{
    left_yards: number;
}

interface PossibleYardageProps{
    data: Array<PossibleYardageDriveRecord>;
    width: number;
    height: number;
}

type StackedYardage = Stack<any,any,any>;

const PossibleYardage = ({data,width, height}:PossibleYardageProps)=>{
    const svgRef = useRef('');
    const team1 = data.length ? data[0].team_1 : null;
    const team2 = data.length ? data[0].team_2 : null;

    // this function creates stacks from summary data
    const stackGenerator = stack().keys(["gained_yards", "left_yards"]);

    // react to changes in input data
    useEffect(()=>{
        // @ts-ignore
        const stackedData = stackGenerator(data.map(dp => {
            return {...dp, left_yards: dp.possible_yards-dp.gained_yards}
        }));

        // stackedData : per drive
        

        // aggStack: aggregate over game
        // @ts-ignore
        const gameData = data.reduce((a,b)=>{
            const idx = b.team===team1? 0 : 1;
            if (a[idx]["possible_yards"]){
                a[idx]["possible_yards"] += b["possible_yards"]
                a[idx]["gained_yards"] += b["gained_yards"];
            } else {
                a[idx] = {...b};
            }
            return a;
        }, [{},{}]);

        const aggregateStack = stackGenerator(gameData.map(d=>{
            // @ts-ignore
            return {...d, left_yards: d.possible_yards-d.gained_yards}
        }));
    
        draw(stackedData, aggregateStack);


    },[data]);


    const drawAxes = (g: SvgSelection, dim: FigureDimensions, stackedData:any): {x:PlotAxis, y:PlotAxis}=>{

        // xscales
        const xDomain = Array(data.length-1).fill(0).map((_,i)=>i.toString());
        const xScale = scaleBand().domain(xDomain).range([0, dim.width]);
        const xAxis = axisBottom(xScale);
        
        // yscales
        const yScale = scaleLinear().domain([-100,100]).range([dim.height, 0]);
        const yAxis = axisLeft(yScale).tickFormat((d:number)=>{
            return Math.abs(Number(d));
        });

        // draw x-axis and move to bottom
        const xAxisArea = g.append("g").attr("class","x-axis")
            .attr("transform",`translate(0,${dim.height})`)
            .call(xAxis);

        // draw y-axis and move to left and rotate
        const yAxisArea = g.append('g').attr('class','y-axis')
            .call(yAxis);

        return {
            x:{scale:xScale, axis: xAxis, g:xAxisArea},
            y:{scale:yScale, axis: yAxis, g:yAxisArea}
        }
    };

    const drawSummaryAxes = (g:SvgSelection, dim: FigureDimensions, stackedData: any): {x:PlotAxis, y:PlotAxis} => {
        // no x-axis needed

        const maxYardage = Math.max(...stackedData[1][1]);
        const yScale = scaleLinear().domain([-1*maxYardage, maxYardage]).range([dim.height,0]);
        const yAxis = axisLeft(yScale).tickFormat((d)=>Math.abs(d));
        
        const yAxisArea = g.append('g').attr('class','y-axis').call(yAxis);
        return {x:{scale:null, axis:null, g:null}, y:{scale:yScale, axis:yAxis, g:yAxisArea}};
    }


    const drawBars = (g:SvgSelection, dim:FigureDimensions, x:PlotAxis, y:PlotAxis, stackedData:any):void =>{


        // create a new group for each stack level
        g.selectAll('g.bars').data(stackedData)
            .join('g').classed('bars',true)
            .attr("class",(_,i)=>{
                if (i==0){
                    return "gained-yards";
                } else {
                    return "left-yards";
                }
            });
        
        const ly = g.select("g.left-yards");

        // plot gained yards by team
        g.selectAll("g.gained-yards").data(stackedData[0])
            .enter()
            .append('rect')
            .attr('width',20)
            .attr('class',(d)=>{
                return `team-${String(d.data['team']).toLowerCase()}`;
            })
            .attr('x',(d,i)=>{
                return x.scale(i.toString());
            })
            .attr('y',(d)=>{
                const isTeam1 = d.data.team == team1;
                if (isTeam1){
                    // align to baseline
                    return y.scale(d[1]);
                } else {
                    return y.scale(0);
                }
            })
            .attr('height',(d)=>{
                return y.scale(d[0]) - y.scale(d[1]);
                
            });

        g.selectAll("g.left-yards").data(stackedData[1])
            .enter()
            .append('rect')
            .attr('width',20)
            .attr('fill',(d)=>{
                return rgb(100,100,100,0.25);
            })
            .attr('x',(d,i)=>{
                return x.scale(i.toString());
            })
            .attr('y',(d)=>{
                const isTeam1 = d.data.team == team1;
                if (isTeam1){
                    // align to baseline
                    return y.scale(d[1]);
                } else {
                    return y.scale(-1*d[0]);
                }
            })
            .attr('height',(d)=>{
                const isTeam1 = d.data.team == team1;
                if (isTeam1){
                    return y.scale(d[0]) - y.scale(d[1]);
                } else {
                    return y.scale(-1*d[1])-y.scale(-1*d[0]);
                }
                
            });

    }

    const drawSummaryBar = (g: SvgSelection, dim: FigureDimensions, x:PlotAxis, y:PlotAxis, stackedData: any): void => {
        // create a new group for each stack level
        g.selectAll('g.bars').data(stackedData)
            .join('g').classed('bars',true)
            .attr("class",(_,i)=>{
                if (i==0){
                    return "gained-yards";
                } else {
                    return "left-yards";
                }
            });
        
        const ly = g.select("g.left-yards");

        // plot gained yards by team
        g.selectAll("g.gained-yards").data([[],...stackedData[0]])
            .enter()
            .append('rect')
            .attr('width',20)
            .attr('class',(d)=>{
                return `team-${String(d.data['team']).toLowerCase()}`;
            })
            .attr('x',(d,i)=>{
                return 0;
            })
            .attr('y',(d)=>{
                const isTeam1 = d.data.team == team1;
                console.log(`team 1 is ${team1} and team is ${d.data.team}`);
                if (isTeam1){
                    // align to baseline
                    return y.scale(d[1]);
                } else {
                    return y.scale(0);
                }
            })
            .attr('height',(d)=>{
                return y.scale(d[0]) - y.scale(d[1]);
                
            });

        g.selectAll("g.left-yards").data([[], ...stackedData[1]])
            .enter()
            .append('rect')
            .attr('width',20)
            .attr('fill',(d)=>{
                return rgb(100,100,100,0.25);
            })
            .attr('x',(d,i)=>{
                return 0;
            })
            .attr('y',(d)=>{
                const isTeam1 = d.data.team == team1;
                if (isTeam1){
                    // align to baseline
                    return y.scale(d[1]);
                } else {
                    return y.scale(-1*d[0]);
                }
            })
            .attr('height',(d)=>{
                const isTeam1 = d.data.team == team1;
                if (isTeam1){
                    return y.scale(d[0]) - y.scale(d[1]);
                } else {
                    return y.scale(-1*d[1])-y.scale(-1*d[0]);
                }
                
            });
    }

    const drawTitle = (g:SvgSelection, dim:FigureDimensions, data) =>{
        const titleGroup = g.append('g').attr('class','plot-title')
            .attr('transform',`translate(${dim.width/2},${dim.margin.top})`)
            .append('text').attr('text-anchor',"middle")
            .style("fill","white")
            .text(`${data[0]['team_1']} vs ${data[0]['team_2']}`);

        return titleGroup;
    }

    const draw = useCallback((stackedData, aggregateStack)=>{
        if (stackedData[0].length==0){
            return;
        }

        // figure dimensions
        const figdim = computeDimensions(width, height, {left:50,right:50, top:50, bottom:50});

        const svg = setSVG(select(svgRef.current), figdim);

        // create plot area and return selection handler
        const plotArea = setPlotArea(svg, figdim);
        const summaryArea = setMarginArea(svg, figdim, 'right');

        // create and draw axes based on data
        const {x,y} = drawAxes(plotArea, figdim, stackedData);
        const r = drawSummaryAxes(summaryArea, figdim, aggregateStack);

        // create and draw bars
        drawBars(plotArea, figdim, x, y, stackedData);
        drawSummaryBar(summaryArea, figdim, r.x, r.y, aggregateStack);

        // draw ttitle
        drawTitle(svg, figdim, data);



    },[data, width, height]);
    
    return <div class="nfl-datavis-figure possible-yardage" ref={svgRef} style={{
        boxSizing:'border-box',
        display:'block',
        width: `${width}px`, 
        height: `${height}px`
        }}>
    </div>
}

export default PossibleYardage;