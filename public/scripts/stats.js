class Stats {
  correct = 0;
  incorrect = 0;

  wpm(sec) {
    return Math.round(60 * (((this.correct + this.incorrect) / 5) / sec));
  }

  cpm(sec) {
    return Math.round(60 * ((this.correct + this.incorrect) / sec));
  }

  acc() {
    return Math.round(100 * (this.correct) / (this.correct + this.incorrect));
  }
}