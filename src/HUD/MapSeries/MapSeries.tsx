import React from "react";
import * as I from "csgogsi-socket";
import { Match, Veto } from '../../api/interfaces';
import TeamLogo from "../MatchBar/TeamLogo";
import "./mapseries.scss";
import mirageIcon from "../../assets/maps/mirage_icon.png";
import vertigoIcon from "../../assets/maps/vertigo_icon.png";
import nukeIcon from "../../assets/maps/nuke_icon.png";
import infernoIcon from "../../assets/maps/inferno_icon.png";
import overpassIcon from "../../assets/maps/overpass_icon.png";
import ancientIcon from "../../assets/maps/ancient_icon.png";
import anubisIcon from "../../assets/maps/anubis_icon.png";

import mirageImage from "../../assets/maps/mirage.png";
import vertigoImage from "../../assets/maps/vertigo.png";
import nukeImage from "../../assets/maps/nuke.png";
import infernoImage from "../../assets/maps/inferno.png";
import overpassImage from "../../assets/maps/overpass.png";
import ancientImage from "../../assets/maps/ancient.png";
import anubisImage from "../../assets/maps/anubis.png";

interface IProps {
    match: Match | null;
    teams: I.Team[];
    isFreezetime: boolean;
    map: I.Map
}

interface IVetoProps {
    veto: Veto;
    teams: I.Team[];
    active: boolean;
}

const getMapImage = (map: string) => {
    switch (map) {
        case "de_mirage":
            return mirageImage;
        case "de_vertigo":
            return vertigoImage;
        case "de_nuke":
            return nukeImage;
        case "de_inferno":
            return infernoImage;
        case "de_overpass":
            return overpassImage;
        case "de_ancient":
            return ancientImage;
        case "de_anubis":
            return anubisImage;
    }
}

const getMapIcon = (map: string) => {
    switch (map) {
        case "de_mirage":
            return mirageIcon;
        case "de_vertigo":
            return vertigoIcon;
        case "de_nuke":
            return nukeIcon;
        case "de_inferno":
            return infernoIcon;
        case "de_overpass":
            return overpassIcon;
        case "de_ancient":
            return ancientIcon;
        case "de_anubis":
            return anubisIcon;
    }
}

class VetoEntry extends React.Component<IVetoProps> {
    render() {
        const { veto, teams, active } = this.props;
        return <div className={`veto_container ${active ? 'active' : ''}`}>
            <div className="veto_map_name">
                <img src={getMapIcon(veto.mapName)} alt="Map" />
            </div>
            <div className="veto_picker">
                <TeamLogo team={teams.filter(team => team.id === veto.teamId)[0]} />
            </div>
            <div className="veto_score">
                <img className="map-image" src={getMapImage(veto.mapName)} alt="Map Image" />
                <div className="score">
                    <TeamLogo team={teams[0]} />
                    {Object.values((veto.score || ['-', '-'])).sort().join(":")}
                    <TeamLogo team={teams[1]} />
                </div>
                <div className='active_container'>
                    <div className='active'>Playing</div>
                </div>
            </div>
        </div>
    }
}

export default class MapSeries extends React.Component<IProps> {

    render() {
        const { match, teams, isFreezetime, map } = this.props;
        const bo = (match && Number(match.matchType.substr(-1))) || 0;
        if (!match || !match.vetos.length) return null;
        return (
            <div className={`map_series_container ${isFreezetime && map.round % 10 === 0 ? 'show' : 'hide'}`}>
                <div className="title_bar">
                    <div className="map">Map</div>
                    <div className="picked">Pick</div>
                    <div className="score">Score</div>
                </div>
                {match.vetos.filter(veto => veto.type !== "ban").map(veto => {
                    if (!veto.mapName) return null;
                    return <VetoEntry key={`${match.id}${veto.mapName}${veto.teamId}${veto.side}`} veto={veto} teams={teams} active={map.name.includes(veto.mapName)} />
                })}
            </div>
        );
    }
}
