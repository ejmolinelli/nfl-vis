import {BaseType, Selection} from '@types/d3'

type SvgSelection = Selection<SVGSVGElement, unknown, HTMLElement, any>
    | Selection<SVGGElement, unknown, HTMLElement, any> 
    | Selection<BaseType, unknown, HTMLElement, any>;

interface FigureMargin{
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface FigureDimensions{
    width:number;
    height:number
    margin: FigureMargin;
}


const computeDimensions = (width: number, height: number, margin: FigureMargin): FigureDimensions =>{
    return {
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
        margin
    };
}

// add svg to HTML DOM selection
const setSVG = (sel: SvgSelection, dims: FigureDimensions): SvgSelection =>{
    const svg = sel.append('svg')
        .attr('width',dims.width + dims.margin.left + dims.margin.right)
        .attr('height',dims.height + dims.margin.bottom + dims.margin.top)
    return svg;
}

// add a plot area to svg according to figure dimensions
const setPlotArea = (svg: SvgSelection, dims:FigureDimensions): SvgSelection => {
    const plotArea = svg
        .attr("width", dims.width + dims.margin.left + dims.margin.right)
        .attr("height", dims.height + dims.margin.bottom + dims.margin.top)
        .append('g');
    
    plotArea.attr('transform', `translate(${dims.margin.left},${dims.margin.top})`);
    return plotArea as SvgSelection;
};


export type {
    SvgSelection,
    FigureDimensions,
    FigureMargin
}

export {
    computeDimensions,
    setSVG,
    setPlotArea
}