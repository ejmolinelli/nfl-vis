/*
Axis types
*/

import {Axis, ScaleLinear} from 'd3';
import { SvgSelection } from '../utils';


interface PlotAxis{
    scale: ScaleLinear<any,any>;
    axis: Axis<any>;
    g?: SvgSelection;
}


export type {
    PlotAxis
}