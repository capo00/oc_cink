import UU5 from "uu5g04";
import { useState, useEffect, useRef } from "uu5g04-hooks";
import "uu5g04-bricks";

const LOG = location.hostname === "localhost";

const Env = {
  name: "Cink"
};

// TODO replace uu5g04
const COLORS = UU5.Environment.colors;
const Config = { Css: UU5.Common.Css.createCssModule(Env.name.toLowerCase()) };
const ScreenSize = UU5.Utils.ScreenSize;

function useWillMount(func) {
  const willMount = useRef(true);
  if (willMount.current) func();
  willMount.current = false;
}

const icons = {
  "D": "mdi-cards-diamond",
  "H": "mdi-cards-heart",
  "S": "mdi-cards-spade",
  "C": "mdi-cards-club"
};

const nums = [7, 8, 9, 10, 11, 12, 13, 14];
const numMap = { 11: "J", 12: "Q", 13: "K", 14: "A" };
const kinds = Object.keys(icons);

function pack() {
  const pack = [];

  kinds.forEach(kind => {
    nums.forEach(num => pack.push(new Card(num, kind)))
  });

  return pack;
}

function getRandom(max, min = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomCard(pack) {
  const i = getRandom(pack.length - 1);
  const card = pack[i];
  pack.splice(i, 1);
  return card;
}

function shuffle(pack) {
  pack = [...pack];
  const shuffledPack = [];

  while (pack.length) {
    const randomCard = getRandomCard(pack);
    shuffledPack.push(randomCard);
  }

  return shuffledPack;
}

function _Card({ onClick, color, children, hidden, selected }) {
  const bg = COLORS.cyan;
  const classNames = [
    Config.Css.css`
        display: inline-flex;
        width: ${hidden ? "36px" : undefined};
        height: ${hidden ? "60px" : undefined};
        border-radius: 4px;
        align-items: center;
        justify-content: center;
        position: relative;
        background: ${hidden ? `radial-gradient(circle, ${bg.c900} 0%, ${bg.c500} 100%)` : undefined};

        & + & {
          margin: ${hidden ? "4px 0 4px -48px!important" : undefined};
        }

        ${ScreenSize.getMinMediaQueries("m", `
          width: ${hidden ? "56px" : undefined};
          height: ${hidden ? "93px" : undefined};
        `)}
      `,
    Config.Css.css`
        cursor: ${onClick ? "pointer" : undefined};
        color: ${hidden ? "#fff" : color};
        border: ${selected ? "2px solid black" : undefined};
      `
  ];

  return (
    <Uu5Card
      colorSchema="custom"
      className={classNames.join(" ")}
      mainAttrs={{ onClick }}
    >
      {children}
    </Uu5Card>
  );
}

class Card {
  constructor(num, kind) {
    this.num = num;
    this.kind = kind;
  }

  render({ onClick, hidden, selected } = {}) {
    const num = numMap[this.num] || this.num;

    const numStyle = {
      position: "absolute"
    };

    const icons = {
      "D": "mdi-cards-diamond",
      "H": "mdi-cards-heart",
      "S": "mdi-cards-spade",
      "C": "mdi-cards-club"
    };

    return (
      <_Card
        key={num + this.kind}
        color={hidden ? undefined : ["D", "H"].includes(this.kind) ? "#F44336" : "#000"}
        onClick={onClick}
        hidden={!!hidden}
        selected={selected}
      >
        {hidden || (
          // <UU5.Common.Fragment>
          //   <UU5.Bricks.Icon icon={icons[this.kind]} className="font-size-xxl" />
          //   <span className={"font-size-xs " + Config.Css.css({ ...numStyle, top: 4, left: 4 })}>{num}</span>
          //   <span className={"font-size-xs " + Config.Css.css({ ...numStyle, bottom: 4, right: 4 })}>{num}</span>
          // </UU5.Common.Fragment>
          <img
            width={36}
            className={Config.Css.css`
                ${ScreenSize.getMinMediaQueries("m", `
                  width: 56px;
                `)}
              `}
            src={`assets/cards/${this.kind.toLowerCase() + this.num}.jpg`} alt={this.kind + this.num}
          />
        )}
      </_Card>
    );
  }
}

function dealCards(pack, players) {
  pack = [...pack];
  return players.forEach(player => {
    const cards = [];

    for (let i = 0; i < 8; i++) {
      cards.push(pack.shift());
    }

    player.cards = cards;
  });
}

function Pack({ cards, onClick, hidden }) {
  // TODO replace by g05
  return (
    <UU5.Common.Fragment>
      {cards.map((card, i) => card.render({
        onClick: onClick ? () => onClick(card, i) : undefined,
        hidden: hidden ? cards.length : false,
      }))}
    </UU5.Common.Fragment>
  )
}

function Bank({ children, onClick, size = 32, iconHidden }) {
  // TODO replace Icon by g05
  return (
    <span
      className={Config.Css.css`
          font-size: ${size}px;
          cursor: ${onClick ? "pointer" : undefined}
        `}
      onClick={onClick}
    >
        {!iconHidden && <UU5.Bricks.Icon icon="mdi-cash-multiple" />} {children} €
      </span>
  );
}

// TODO replace Card by g05
function Uu5Card({ className, colorSchema, mainAttrs, children }) {
  return <UU5.Bricks.Card {...{ className, colorSchema, mainAttrs, children }} />;
}

class Table {
  constructor() {
    this.table = {};
    this.firstCard = null;
    this.availableCards = null;
    this.bank = 0;
  }

  isCardAvailable(card) {
    if (!Object.keys(this.table).length) return true;
    return !!this.availableCards.find(c => c === card);
  }

  addCard(card) {
    let line;
    if (!this.firstCard) this.firstCard = card;

    if (this.table[card.kind]) {
      line = this.table[card.kind];
    } else {
      line = this.table[card.kind] = Array(8).fill(null);
    }
    line[card.num - 7] = card;
    log(`Table: Card was added.`, card);

    this._buildAvailableCards();
  }

  increaseBank(count = 1) {
    this.bank = this.bank + count;
    log(`Table: Increase bank about ${count} to ${this.bank}.`);
    return this.bank;
  }

  render() {
    return (
      <Uu5Card colorSchema="green-rich" className={Config.Css.css`
          padding: 2px;
          ${ScreenSize.getMinMediaQueries("m", `
            padding: 8px;
          `)}
        `}>
        <Bank>{this.bank}</Bank>
        <br />
        <div className={Config.Css.css`
            display: inline-grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(4, 1fr);
            min-height: 280px;

            ${ScreenSize.getMinMediaQueries("m", `
              min-height: 414px;
            `)}
          `}>
          {Object.keys(this.table).map(kind => (
            this.table[kind].map((card, i) => {
              return card ? card.render({ selected: card === this.firstCard }) : <span key={i} />
            })
          ))}
        </div>
      </Uu5Card>
    )
  }

  _buildAvailableCards() {
    const availableCards = [];

    const currentKinds = Object.keys(this.table);
    currentKinds.forEach(kind => {
      let firstCard = false;
      for (let i = 0; i < this.table[kind].length; i++) {
        const card = this.table[kind][i];
        if (card && !firstCard) {
          firstCard = card;
          if (card.num > 7) {
            const availableCard = PACK.find(c => c.num === card.num - 1 && c.kind === card.kind);
            availableCards.push(availableCard);
          }
        } else if (!card && firstCard) {
          const lastCard = this.table[kind][i - 1];
          const availableCard = PACK.find(c => c.num === lastCard.num + 1 && c.kind === lastCard.kind);
          availableCards.push(availableCard);
          break;
        }
      }
    });

    const numCards = PACK.filter(c => c.num === this.firstCard.num && currentKinds.indexOf(c.kind) < 0);

    this.availableCards = [...availableCards, ...numCards];
    log(`Table: Available cards.`, this.availableCards);
  }
}

function log(...args) {
  LOG && console.log(...args);
}

function Round({ user, players, initialPlayerIndex, onEnd }) {
  const table = useRef(new Table()).current;

  const [playerIndex, setPlayerIndex] = useState(initialPlayerIndex);
  const [winner, setWinner] = useState(null);

  useWillMount(() => {
    log(`Round: New round`, user, players, initialPlayerIndex);
    [user, ...players].forEach((player, i) => {
      let diff = player.decreaseBank();
      if (diff === 0) {
        log(`${player.name}: No bank. He is replaced.`, player.bank);
        player = players[i - 1] = new RobotPlayer(getRandomName());
        log(`${player.name}: New player replaced old one.`);
        diff = player.decreaseBank();
      }
      table.increaseBank(diff);
    });
  });

  function nextPlayer() {
    let newPlayerIndex = playerIndex + 1;
    setPlayerIndex(newPlayerIndex > 3 ? 0 : newPlayerIndex);
  }

  function nextRound() {
    [user, ...players].forEach((player, i) => {
      if (player === winner) {
        if (winner.looser) {
          // TODO
          log(`${winner.name}: No bank for game, no winner.`, table.bank);
        } else {
          log(`${winner.name}: Winner.`, table.bank);
          winner.increaseBank(table.bank);
        }
      } else {
        winner.increaseBank(player.decreaseBank(player.cards.length));
      }
    });
    onEnd();
  }

  function endRound(winner) {
    setWinner(winner);
    log(`${winner.name}: Winner.`);
  }

  function playCard(player, card) {
    player.removeCard(card);
    table.addCard(card);

    if (player.cards.length) {
      nextPlayer();
    } else {
      endRound(player);
    }
  }

  function playBank(player) {
    table.increaseBank(player.decreaseBank());
    nextPlayer();
  }

  useEffect(() => {
    setTimeout(() => {
      // playerIndex === 0 => user is playing => waiting on click from user
      if (playerIndex !== 0) {
        const activePlayer = players[playerIndex - 1];
        const card = activePlayer.findAvailableCard(table.availableCards);

        if (card) {
          playCard(activePlayer, card);
        } else {
          playBank(activePlayer);
        }
      }
    }, 1000);
  }, [playerIndex]);

  function userClick(card) {
    if (table.isCardAvailable(card)) {
      playCard(user, card);
    } else {
      console.warn("Cannot add this card to the table.", card);
    }
  }

  function userBankClick() {
    const availableCard = user.findAvailableCard(table.availableCards);
    if (availableCard) {
      console.warn("User has available card to play.", availableCard);
    } else {
      playBank(user);
    }
  }

  // TODO Row, Column replace by grid
  // TODO Button replace by g05
  return (
    <div>
      <UU5.Bricks.Row>
        {players.map((player, i) => (
          <UU5.Bricks.Column key={i} colWidth="xs-4" noSpacing>
            {player.render({ active: !winner && i + 1 === playerIndex })}
          </UU5.Bricks.Column>
        ))}
      </UU5.Bricks.Row>

      {table.render()}

      <div>
        {user.render({
          onCardClick: userClick,
          onBankClick: userBankClick,
          active: !winner && playerIndex === 0,
        })}
        {winner && (
          <UU5.Bricks.Button colorSchema="primary" size="xl" onClick={nextRound} displayBlock>
            Pokračovat
          </UU5.Bricks.Button>
        )}
      </div>
    </div>
  )
}

const BANK = 20;

class Player {
  constructor(name, bank = BANK) {
    this.name = name;
    this._bank = bank;
    this.cardList = [];
  }

  set cards(cards) {
    this.cardList = cards;
  }

  get cards() {
    return this.cardList;
  }

  removeCard(card) {
    this.cardList.splice(this.cardList.findIndex(c => c === card), 1);
    log(`${this.name}: Card was removed.`, card);
    return card;
  }

  get bank() {
    return this._bank;
  }

  decreaseBank(count = 1) {
    this._bank = this._bank - count;
    if (this._bank < 0) {
      count = count + this._bank;
      this._bank = 0;
    }
    log(`${this.name}: Decrease bank about ${count} to ${this._bank}.`);
    return count;
  }

  increaseBank(count = 1) {
    this._bank = this._bank + count;
    log(`${this.name}: Increase bank about ${count} to ${this._bank}.`);
    return count;
  }

  findAvailableCard(cards) {
    let card;

    if (cards) {
      for (let i = 0; i < this.cards.length; i++) {
        const availableCard = cards.find(c => c === this.cards[i]);
        if (availableCard) {
          card = availableCard;
          break;
        }
      }
    } else {
      card = this.cards[0];
    }

    return card;
  }
}

function loadBank() {
  let bank = localStorage.getItem("bank");
  if (bank) {
    bank = +bank;
  } else {
    saveBank(BANK);
    bank = BANK;
  }
  return bank;
}

function saveBank(bank) {
  localStorage.setItem("bank", bank);
}

class User extends Player {

  set cards(cards) {
    cards.sort((card1, card2) => {
      if (card1.kind < card2.kind) return -1;
      if (card1.kind > card2.kind) return 1;

      if (card1.num < card2.num) return -1;
      if (card1.num > card2.num) return 1;

      return 0;
    });
    super.cards = cards;
  }

  get cards() {
    return super.cards;
  }

  decreaseBank(count) {
    const r = super.decreaseBank(count);
    saveBank(this._bank);
    return r;
  }

  increaseBank(count) {
    const r = super.increaseBank(count);
    saveBank(this._bank);
    return r;
  }

  render({ onCardClick, onBankClick, active }) {
    return (
      <Uu5Card colorSchema={active ? "primary" : undefined} className={Config.Css.css`
          padding: 2px;
          ${ScreenSize.getMinMediaQueries("m", `
            padding: 8px;
          `)}
        `}>
        <Bank onClick={active ? onBankClick : undefined}>{this.bank}</Bank><br />
        <Pack
          cards={this.cards}
          onClick={active ? onCardClick : undefined}
        />
      </Uu5Card>
    )
  }
}

class RobotPlayer extends Player {

  constructor(name, bank) {
    super(name, bank);
    this.looser = false;
  }

  decreaseBank(count) {
    const r = super.decreaseBank(count);
    if (count !== r) this.looser = true;
    return r;
  }

  // TODO replace ScreenSize by hooks!!!
  // TODO replace Badge by card with number
  render({ active }) {
    return (
      <UU5.Bricks.ScreenSize>
        {({ screenSize }) => {
          if (["xs", "s"].includes(screenSize)) {
            return (
              <Uu5Card
                key={this.name}
                colorSchema={active ? "primary" : undefined}
                className={Config.Css.css`padding: 2px; display: flex; justify-content: space-between; align-items: center;`}
              >
                  <span>
                    {this.name} <UU5.Bricks.Badge colorSchema="black">{this.cards.length}</UU5.Bricks.Badge>
                  </span>
                <Bank size={15} iconHidden>{this.bank}</Bank>
              </Uu5Card>
            )
          } else {
            return (
              <Uu5Card
                key={this.name}
                colorSchema={active ? "primary" : undefined}
                className={Config.Css.css`padding: 8px;`}
              >
                <span className={Config.Css.css`font-size: 32px;`}>{this.name}</span>
                <div className={Config.Css.css`
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  `}>
                  <div>
                    <Pack cards={this.cards} hidden />
                  </div>
                  <Bank>{this.bank}</Bank>
                </div>
              </Uu5Card>
            )
          }
        }}
      </UU5.Bricks.ScreenSize>
    )
  }
}

const PACK = pack();

function Game({ user, players, onEnd }) {
  const [playerIndex, setPlayerIndex] = useState(() => getRandom(3));
  dealCards(shuffle(PACK), [user, ...players]);

  return (
    <Round
      key={playerIndex}
      players={players}
      user={user}
      initialPlayerIndex={playerIndex}
      onEnd={() => {
        if (user.bank <= 0) {
          onEnd();
        } else {
          setPlayerIndex(playerIndex + 1 > 3 ? 0 : playerIndex + 1);
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
  return NAMES[getRandom(NAMES.length - 1)];
}

function IncreaseBankButton({ onClick, user }) {
  function increaseBank() {
    user.increaseBank(BANK);
    onClick();
  }

  // TODO replace by g05
  return (
    <UU5.Bricks.Button colorSchema="danger" size="xl" onClick={increaseBank} displayBlock>
      Navýšit rozpočet
    </UU5.Bricks.Button>
  )
}

export default function Prototype() {
  const user = new User("User", loadBank());
  const players = [
    new RobotPlayer(getRandomName()),
    new RobotPlayer(getRandomName()),
    new RobotPlayer(getRandomName()),
  ];

  const [num, setNum] = useState(0);

  function reload() {
    setNum(num + 1);
  }

  return (
    <div>
      {user.bank ? <Game user={user} players={players} onEnd={reload} /> : (
        <IncreaseBankButton onClick={reload} user={user} />
      )}
    </div>
  );
}
