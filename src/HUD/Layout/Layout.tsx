import React from "react";
import TeamBox from "./../Players/TeamBox";
import MatchBar from "../MatchBar/MatchBar";
import SeriesBox from "../MatchBar/SeriesBox";
import Observed from "./../Players/Observed";
import { CSGO, Team, RoundInfo } from "csgogsi-socket";
import { Match } from "../../api/interfaces";
import RadarMaps from "./../Radar/RadarMaps";
import Trivia from "../Trivia/Trivia";
import SideBox from '../SideBoxes/SideBox';
import { GSI, actions } from "./../../App";
import MoneyBox from '../SideBoxes/Money';
import UtilityLevel from '../SideBoxes/UtilityLevel';
import Killfeed from "../Killfeed/Killfeed";
import MapSeries from "../MapSeries/MapSeries";
import Overview from "../Overview/Overview";
import Tournament from "../Tournament/Tournament";
import Pause from "../PauseTimeout/Pause";
import Timeout from "../PauseTimeout/Timeout";
import PlayerCamera from "../Camera/Camera";

interface Props {
  game: CSGO,
  match: Match | null
}

interface State {
  winner: Team | null,
  showWin: boolean,
  forceHide: boolean,
  forceShowUtilityLevel: boolean,
  tboxes: boolean,
}

const getRound = (round: number | undefined) => {
  switch (round) {
    case 5:
      return round;
    case 10:
      return round;
    case 15:
      return round;
    case 20:
      return round;
    case 25:
      return round;
    case 30:
      return round;
    default:
      return;
  }
};
export default class Layout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      winner: null,
      showWin: false,
      forceHide: false,
      forceShowUtilityLevel: false,
      tboxes: false,
    }
  }

  componentDidMount() {
    GSI.on('roundEnd', score => {
      this.setState({ winner: score.winner, showWin: true }, () => {
        setTimeout(() => {
          this.setState({ showWin: false })
        }, 4000)
      });
    });
    GSI.on('bombPlant', player => {
      this.setState({ forceShowUtilityLevel: true }, () => {
        setTimeout(() => {
          this.setState({ forceShowUtilityLevel: false })
        }, 5000)
      });
    });
    actions.on("boxesState", (state: string) => {
      if (state === "show") {
        this.setState({ forceHide: false });
      } else if (state === "hide") {
        this.setState({ forceHide: true });
      }
    });
    actions.on("tboxesState", (state: string) => {
      if (state === "show") {
        this.setState({ tboxes: false });
      } else if (state === "hide") {
        this.setState({ tboxes: true });
      }
    });
  }

  getVeto = () => {
    const { game, match } = this.props;
    const { map } = game;
    if (!match) return null;
    const mapName = map.name.substring(map.name.lastIndexOf('/') + 1);
    const veto = match.vetos.find(veto => veto.mapName === mapName);
    if (!veto) return null;
    return veto;
  }

  render() {
    const { game, match } = this.props;
    const left = game.map.team_ct.orientation === "left" ? game.map.team_ct : game.map.team_t;
    const right = game.map.team_ct.orientation === "left" ? game.map.team_t : game.map.team_ct;

    const leftPlayers = game.players.filter(player => player.team.side === left.side);
    const rightPlayers = game.players.filter(player => player.team.side === right.side);
    const isFreezetime = (game.round && game.round.phase === "freezetime") || game.phase_countdowns.phase === "freezetime";
    const { forceHide } = this.state;
    const { tboxes } = this.state;
    const roundsArr: Partial<RoundInfo>[] = [];
    game.map.rounds.forEach((round) => roundsArr.push(round));

    for (let i = roundsArr.length + 1; i < 31; i++) {
      roundsArr.push({
        round: i,
      });
    }

    return (
      <div className="layout">
        <div className={`players_alive`}>
          <div className="title_container">Players alive</div>
          <div className="counter_container">
            <div className={`team_counter ${left.side}`}>{leftPlayers.filter(player => player.state.health > 0).length}</div>
            <div className={`vs_counter`}>VS</div>
            <div className={`team_counter ${right.side}`}>{rightPlayers.filter(player => player.state.health > 0).length}</div>
          </div>
        </div>
        <Killfeed />
        <Overview match={match} map={game.map} players={game.players || []} />
        <RadarMaps match={match} map={game.map} game={game} />
        <MatchBar map={game.map} phase={game.phase_countdowns} bomb={game.bomb} match={match} isFreezeTime={isFreezetime} />
        <Pause  phase={game.phase_countdowns}/>
        <Timeout map={game.map} phase={game.phase_countdowns} />
        <SeriesBox map={game.map} phase={game.phase_countdowns} match={match} />

        <Tournament />

        <Observed player={game.player} veto={this.getVeto()} round={game.map.round+1}/>

        <TeamBox team={left} players={leftPlayers} side="left" current={game.player} hide={tboxes} />
        <TeamBox team={right} players={rightPlayers} side="right" current={game.player} hide={tboxes}/>

        <Trivia />

        <MapSeries teams={[left, right]} match={match} isFreezetime={isFreezetime} map={game.map} />
        <div className={"boxes left"}>
          <UtilityLevel side={left.side} players={game.players} show={(isFreezetime && !forceHide) || this.state.forceShowUtilityLevel} />
          <SideBox side="left" hide={forceHide} />
          <MoneyBox
            team={left.side}
            side="left"
            loss={Math.min(left.consecutive_round_losses * 500 + 1400, 3400)}
            equipment={leftPlayers.map(player => player.state.equip_value).reduce((pre, now) => pre + now, 0)}
            money={leftPlayers.map(player => player.state.money).reduce((pre, now) => pre + now, 0)}
            show={isFreezetime && !forceHide}
          />
        </div>
        <div className={"boxes right"}>
          <UtilityLevel side={right.side} players={game.players} show={(isFreezetime && !forceHide) || this.state.forceShowUtilityLevel} />
          <SideBox side="right" hide={forceHide} />
          <MoneyBox
            team={right.side}
            side="right"
            loss={Math.min(right.consecutive_round_losses * 500 + 1400, 3400)}
            equipment={rightPlayers.map(player => player.state.equip_value).reduce((pre, now) => pre + now, 0)}
            money={rightPlayers.map(player => player.state.money).reduce((pre, now) => pre + now, 0)}
            show={isFreezetime && !forceHide}
          />
        </div>
      </div>
    );
  }
}
