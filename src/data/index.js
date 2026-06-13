import { sphs101 } from './sphs101';
import { sphs102 } from './sphs102';
import { sphs103 } from './sphs103';
import { sphs104 } from './sphs104';
import { sphs105 } from './sphs105';

export const allPapers = [sphs101, sphs102, sphs103, sphs104, sphs105];

export function getPaperByCode(code) {
  return allPapers.find(p => p.code === code) || null;
}

export function getAllQuestions() {
  const questions = [];
  for (const paper of allPapers) {
    for (const unit of paper.units) {
      for (const q of unit.twoMark) {
        questions.push({ ...q, paperCode: paper.code, paperTitle: paper.shortTitle, unitTitle: unit.title, markType: '2' });
      }
      for (const q of unit.eightMark || []) {
        questions.push({ ...q, paperCode: paper.code, paperTitle: paper.shortTitle, unitTitle: unit.title, markType: '8' });
      }
      for (const q of unit.fifteenMark) {
        questions.push({ ...q, paperCode: paper.code, paperTitle: paper.shortTitle, unitTitle: unit.title, markType: '15' });
      }
    }
  }
  return questions;
}
