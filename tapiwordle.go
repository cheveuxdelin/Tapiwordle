package main

import (
	"os"
	"strings"
	"time"
)

const SECONDS_IN_DAY = 86400
const (
	OK = iota
	MISPLACED
	NO
)
const (
	NOT_ON_DICTIONARY = iota
	STILL_PLAYING
	WIN
	LOSE
	BAD_LENGTH
)

type Wordle struct {
	words        map[string]bool
	wordOfTheDay string
	lastUpdated  int
}

func CreateWordle(filename string) (w Wordle, err error) {
	w.words = make(map[string]bool)
	err = w.loadWords(filename)
	if err != nil {
		return w, err
	}
	return w, err
}

func (w *Wordle) loadWords(filename string) (err error) {
	file, err := os.ReadFile(filename)
	if err != nil {
		return
	} else {
		s := strings.Builder{}
		for _, c := range file {
			if c == '\n' {
				var str string = s.String()
				w.words[str] = true
				s.Reset()
			} else {
				s.WriteByte(c)
			}
		}
	}
	return
}

func (w *Wordle) CheckWord(userTypedWord string) (rtn VerifyWordResponse) {
	var wordOfTheDay string = w.GetWordOfTheDay()

	if len(userTypedWord) != len(wordOfTheDay) {
		rtn.Status = BAD_LENGTH
		return
	} else if !w.words[userTypedWord] {
		rtn.Status = NOT_ON_DICTIONARY
		return
	} else {
		var userTypedWordArray []rune = []rune(userTypedWord)
		var answerWordArray []rune = []rune(wordOfTheDay)

		if len(userTypedWordArray) != len(userTypedWord) || len(answerWordArray) != len(userTypedWord) {
			rtn.Status = 30
			return
		}

		rtn.Positions = make([]int, len(wordOfTheDay))
		for i := 0; i < len(wordOfTheDay); i++ {
			rtn.Positions[i] = NO
		}

		var wordSet map[rune]map[int]bool = make(map[rune]map[int]bool)
		var count map[rune]int = make(map[rune]int, len(wordOfTheDay))

		for i, c := range w.wordOfTheDay {
			_, ok := wordSet[c]
			if !ok {
				wordSet[c] = make(map[int]bool)
			}
			wordSet[c][i] = true
		}

		var nGood int
		for i, c := range userTypedWordArray {
			if value, ok := wordSet[c]; !ok {
				continue
			} else if value[i] {
				rtn.Positions[i] = OK
				delete(value, i)
				nGood++
				count[c]++
			}
		}

		for i, c := range userTypedWordArray {
			if value, ok := wordSet[c]; !ok {
				continue
			} else if count[c] < len(value) {
				rtn.Positions[i] = MISPLACED
				count[c]++
			}
		}
		if nGood == len(wordOfTheDay) {
			rtn.Status = WIN
		} else {
			rtn.Status = STILL_PLAYING
		}
		return
	}
}

func (w *Wordle) updateWordOfTheDay() {
	var n int = w.lastUpdated % len(w.words)
	var i int = 0
	for word := range w.words {
		if i < n {
			i++
		} else {
			w.wordOfTheDay = word
			break
		}
	}
}

func daysSinceJan1970() int {
	return int(time.Now().Unix() / SECONDS_IN_DAY)
}

func (w *Wordle) GetWordOfTheDay() string {
	if d := daysSinceJan1970(); w.lastUpdated != d {
		w.lastUpdated = d
		w.updateWordOfTheDay()
	}
	return w.wordOfTheDay
}
