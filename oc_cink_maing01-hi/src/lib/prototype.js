import { useState } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import User from "./common/model/user";
import Opponent from "./common/model/opponent";
import Tools from "./tools";
import Round from "./cink/component/round";
import Welcome from "./cink/component/welcome";
import { INITIAL_BANK } from "./common/model/player";
import Calls from "./calls";

const LOG = location.hostname === "localhost";

function log(...args) {
  LOG && console.log(...args);
}

const WIN_RATIO = 10;

function getBet(winCount) {
  return 1 + Math.floor(winCount / WIN_RATIO);
}

function Game({ user, players, onEnd }) {
  const [playerIndex, setPlayerIndex] = useState(() => Tools.getRandom(3));
  const [looserCount, setLooserCount] = useState(0);

  return (
    <Round
      key={playerIndex}
      players={players}
      user={user}
      initialPlayerIndex={playerIndex}
      bet={getBet(user.winCount)}
      onEnd={(winner) => {
        if (user.bank <= 0) {
          user.updateData({ gameCount: 0, winCount: 0 });
          onEnd();
        } else {
          winner === user && user.winCount++;
          user.gameCount++;

          players.forEach((player, i) => {
            if (!player.bank) {
              log(`${player.name}: No bank. He is replaced.`, player.bank);
              players[i] = new Opponent(getRandomName(), { bank: INITIAL_BANK * getBet(user.winCount) });
              log(`${players[i].name}: New player replaced old one.`);
              setLooserCount(looserCount + 1);
            }
          });

          setPlayerIndex(playerIndex + 1 > 3 ? 0 : playerIndex + 1);
          user.updateData({ gameCount: user.gameCount, winCount: user.winCount });
        }
      }}
    />
  );
}

const NAMES = [
  "Lenka", "Iva", "Tereza", "Lucie", "Jana", "Petra", "Ella", "Natálie", "Marie", "Klára",
  "Ondra", "Matěj", "Jakub", "Jan", "Petr", "Filip", "Karel", "Tomáš", "Jiří", "Pavel"
];

function getRandomName() {
  return NAMES[Tools.getRandom(NAMES.length - 1)];
}

function IncreaseBankButton({ onClick, user }) {
  function increaseBank() {
    user.resetBank();
    onClick();
  }

  return (
    <Uu5Elements.Button meaning="negative" size="xl" onClick={increaseBank} width="100%">
      Navýšit rozpočet
    </Uu5Elements.Button>
  );
}

export default function Prototype() {
  const user = new User("User");
  const attrs = { bank: INITIAL_BANK * getBet(user.winCount) };

  const players = [
    new Opponent(getRandomName(), attrs),
    new Opponent(getRandomName(), attrs),
    new Opponent(getRandomName(), attrs),
  ];

  const [num, setNum] = useState(0);
  const [route, setRoute] = useState("welcome");

  function reload() {
    setNum(num + 1);
    setRoute(user.bank ? "play" : "increaseBank");
  }

  let comp;
  switch (route) {
    case "welcome":
      comp = <Welcome onPlay={() => setRoute("play")} onSetting={() => setRoute("setting")} />;
      break;
    case "increaseBank":
      comp = <IncreaseBankButton onClick={reload} user={user} />;
      break;
    default:
      comp = <Game key={num} user={user} players={players} onEnd={reload} />;
  }

  return (
    <div>
      {comp}
    </div>
  );
}
