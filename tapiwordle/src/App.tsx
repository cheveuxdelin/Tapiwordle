import React from "react"
const COLORS = ["green", "grey", "red", "white"];

const NOT_ON_DICTIONARY = 0;
const STILL_PLAYING = 1;
const WIN = 2;
const LOSE = 3;
const BAD_LENGTH = 4;

const LETTERS: any = {
  "A": true,
  "B": true,
  "C": true,
  "D": true,
  "E": true,
  "F": true,
  "G": true,
  "H": true,
  "I": true,
  "J": true,
  "K": true,
  "L": true,
  "M": true,
  "N": true,
  "O": true,
  "P": true,
  "Q": true,
  "R": true,
  "S": true,
  "T": true,
  "U": true,
  "V": true,
  "W": true,
  "X": true,
  "Y": true,
  "Z": true,
  "DEL": true,
  "GO": true,
}

let n = 6;
let wordSize = 5;

function Square(props: { color: number, letter: string }) {
  return <div className="square noselect" style={{ backgroundColor: COLORS[props.color] }}>{props.letter}</div >
}

type square = {
  color: number;
  letter: string;
};

type response_body = {
  wordle_id: number;
  word: string;
}

type check_word_body = {
  status: number;
  positions: number[];
};

function getEmptySquare() {
  const rtn: square = {
    color: 3,
    letter: "",
  }
  return rtn;
}

function getSquares(): square[] {
  const x = localStorage.getItem("squares");
  let squares: square[];
  if (x) {
    squares = JSON.parse(x);
  } else {
    squares = Array<square>(n * wordSize);
    for (let i = 0; i < n * wordSize; i++) {
      squares[i] = getEmptySquare();
    }
  }
  return squares;
}

function KeyboardKey(props: { keyValue: string, onClick: () => void }) {
  return <div className="keyboard-key noselect" onClick={props.onClick} style={{ gridArea: props.keyValue }}>{props.keyValue}</div>
}

function Keyboard(props: { inputHandler: (key: string) => void }) {
  return (
    <div id="keyboard">
      {Object.keys(LETTERS).map(k => <KeyboardKey onClick={() => props.inputHandler(k)} keyValue={k} key={k} />)}
    </div>
  )
}

export default function App() {
  const [squares, setSquares] = React.useState<square[]>(getSquares());
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [wordLength, setWordLength] = React.useState<number>(5);
  const [canWrite, setCanWrite] = React.useState<boolean>(true);
  const [canDeleteFrom, setCanDeleteFrom] = React.useState<number>(1);
  const [wordle_id, setWordle_id] = React.useState<number>(0);

  function getTypedWord() {
    let rtn = "";
    for (let i = currentIndex - wordLength; i < currentIndex; i++) {
      rtn += squares[i].letter;
    }
    return rtn;
  }

  async function checkWord() {
    if (!canWrite) {
      const response = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({
          wordle_id: wordle_id,
          word: getTypedWord().toLowerCase(),
        } as response_body)
      });
      const responseData: check_word_body = await response.json();
      console.log(responseData);
      if (responseData.status == WIN) {
        alert("WIN");
      } else if (currentIndex == wordLength * n) {
        alert("LOSE");
      } else {
        if (responseData.status == NOT_ON_DICTIONARY) {
          alert("NOT ON DICTIONARY");
        } else  {
          //KEEP PLAYING
          setSquares(oldState => {
            console.log(oldState);
            for (let i = 0; i < wordLength; i++) {
              oldState[currentIndex - wordLength + i].color = responseData.positions[i];
            }
            return oldState;
          })
          setCanDeleteFrom(currentIndex+1);
          setCanWrite(true);
        }
      }
    }
  }

  function deleteSquare() {
    if (currentIndex >= canDeleteFrom) {
      const indexToDelete = currentIndex - 1;
      setSquares(oldState => {
        let rtn = [...oldState];
        rtn[indexToDelete].letter = "";
        setCurrentIndex(indexToDelete);
        return rtn;
      })

      if ((indexToDelete + 1) % wordLength == 0) {
        setCanWrite(!canWrite);
      }
    }
  }

  function writeSquare(s: string) {
    if (canWrite) {
      setSquares(rtn => {
        rtn[currentIndex].letter = s;
        setCurrentIndex(currentIndex + 1);
        return rtn
      })
      if ((currentIndex + 1) % wordLength == 0) {
        setCanWrite(false);
      }
    }
  }

  function inputHandler(s: string) {
    if (s == "BACKSPACE" || s == "DEL") {
      deleteSquare();
    } else if (s == "ENTER" || s == "GO") {
      checkWord();
    } else if (LETTERS[s] != undefined) {
      writeSquare(s);
    }
  }

  return (
    <div className="game" tabIndex={0} onKeyDown={(event) => inputHandler(event.key.toUpperCase())}>
      <header>
        <div>
          Tapiwordle
        </div>
        <div className="logo">
          Tapiwordle
        </div>
        <div>
          Tapiwordle
        </div>
      </header>
      <div id="squares" style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}>
        {squares.map((square, index) =>
          <Square key={index} color={square.color} letter={square.letter} />
        )}
      </div>
      <Keyboard inputHandler={inputHandler} />
    </div>
  )
}
