// World-time clock in slider format
//
// Creates a 'slider' format clock showing hours before and after the current
// time as well as what timezones they are. It looks something like this:
//
// --------------+----------+------------------------
// 20   21   22  | 23:00:00 | 00   01   02   03   04
// --------------+----------+------------------------
// PDT  MDT  CDT     EDT                     UTC  BST
//
//
// Configuration
//
// Add the list of timezones you care about here. Any matching timezones will
// be highlighted if they appear in the list.
//
// Multiple matching timezones (e.g. Pacific daylight time and Arizona time)
// will be shown separated by a command (e.g. PDT,MST)
//
const timeZones = [
    "UTC",
    "US/Eastern",
    "US/Central",
    "US/Mountain",
    "US/Pacific",
    "GB",
]

// A mapping of short timezone name fixes, allowing you to fix any that don't
// match what you expect. For example, the GB timezone in summer shows up as
// GMT+1 but should be BST. Add any entries here you wish to fix the names
// for.
const shortNameFixes = {
    "GMT+1": "BST", // British summer time
}

// How many hours to show before and after the current time. You should make
// sure this covers the range of timezones you care about, otherwise they
// won't be shown.
const hoursBefore = 3;
const hoursAfter = 5;

// Script starts here
import { css } from "uebersicht";

export const command = (dispatch) => {
    const d = new Date();
    const options = {
        timeZoneName: 'short',
        hour: 'numeric',
        hour12: false
    }

    // Mapping of hours to short timezone names
    let timeZoneMap = {}

    for (let tz of timeZones) {
        const localHourTz = new Intl.DateTimeFormat('en-US',
            {timeZone: tz, ...options}).format(d)
        let [hour, shortTz] = localHourTz.split(' ', 2);
        shortTz = shortNameFixes[shortTz] || shortTz;
        timeZoneMap[hour] || (timeZoneMap[hour] = []);
        timeZoneMap[hour].push(shortTz);
    }
    dispatch({
        action: 'UPDATE_TIME',
        timeZoneMap: timeZoneMap,
        currentTime: d
    });
}

export const initialState = {
    timeZoneMap: {},
    currentTime: new Date(),
}

export const updateState = (e, previousState) => {
    if (e.action == 'UPDATE_TIME') {
        return {
            ...previousState,
            timeZoneMap: e.timeZoneMap,
            currentTime: e.currentTime,
        }
    }
    return previousState;
}

// Refresh twice a second, which should make the clock appear fairly
// responsive
export const refreshFrequency = 500 // ms

// Styles

// Widget root
export const className = `
    left: 20px;
    top: 10px;
`

const timeline = css`
    color: rgb(221, 221, 221);
    font-size: 30px;
    font-family: Helvetica;
    font-weight: bold;
    display: flex;
`

const hour = css`
    border-top: 3px solid rgb(221, 221, 221);
    border-bottom: 3px solid rgb(221, 221, 221);
    padding: 0.3em 1em;
    margin: auto 0;
    height: 1.2em;
    line-height: 1.2em;
    background-color: rgba(0,0,0,0.4);
    position: relative;

    &:first-of-type {
        background: linear-gradient(
            to left,
            rgba(0,0,0,0.4),
            rgba(0,0,0,0)
        );
        border-image: linear-gradient(
            to left,
            rgba(221, 221, 221, 1),
            rgba(221, 221, 221, 0)
        ) 1;
        border-right: 0;
    }

    &:last-child {
        background: linear-gradient(
            to right,
            rgba(0,0,0,0.4),
            rgba(0,0,0,0)
        );
        border-image: linear-gradient(
            to right,
            rgba(221, 221, 221, 1),
            rgba(221, 221, 221, 0)
        ) 1;
        border-left: 0;
    }
`

const current = css`
    border: 5px solid rgb(221, 221, 221);
    border-radius: 10px;
    padding: 0.3em 1em;
    height: 1.6em;
    line-height: 1.6em;
    background-color: rgba(0,0,0,0.4);
    position: relative;
`

const tz = css`
    position: absolute;
    top: 65px;
    left: 50%;
    font-size: 0.8em;
    width: 5em;
    margin-left: -2.5em;
    text-align: center;
`

// Main render function
export const render = ({ timeZoneMap, currentTime }) => {
    let items = []
    const currentHour = currentTime.getHours();
    for (let h=currentHour - hoursBefore; h <= currentHour + hoursAfter; h++) {
        const realH = ((h % 24) + 24) % 24; // Deal with negative hours
        const realHFormatted = realH.toLocaleString('default', {minimumIntegerDigits: 2});
        const timeZones = (timeZoneMap[realHFormatted] || [])
        const timeZoneItems = <div className={tz}>{timeZones.join(",")}</div>;
        if (h == currentHour) {
            items.push(<div className={current} key={realHFormatted}>{
                currentTime.toLocaleTimeString(
                'default', {hour12: false})}{timeZoneItems}</div>);
        } else {
            items.push(<div className={hour}
                key={realHFormatted}>{realHFormatted}{timeZoneItems}</div>);
        }
    }
    return(
        <div className={timeline}>
            {items}
        </div>
    );
}
