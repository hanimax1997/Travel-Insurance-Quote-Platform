import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import moment from 'moment';
import { Patterns } from './patterns';

/* ───────────────────────────────────────────
 *  DATES
 * ─────────────────────────────────────────── */

/** La date ne doit pas être dans le futur */
export const notInFuture = (): ValidatorFn => (ctrl: AbstractControl): ValidationErrors | null =>
  ctrl.value && moment(ctrl.value).isAfter(moment(), 'day') ? { notInFuture: true } : null;

/** Âge compris entre `min` et `max` ans */
// Exemple de CV.ageBetween(min, max)
export function ageBetween(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) { return null; }

    const age = Math.floor(
      (Date.now() - new Date(value).getTime()) / 31_557_600_000   // milliseconde → années
    );

    if (age < min)  { return { ageTooYoung: { min, actual: age } }; }
    if (age > max)  { return { ageTooOld:  { max, actual: age } }; }

    return null;
  };
}
/** Vérifie que dateFin ≥ dateDébut (les deux controls peuvent être indépendants) */
export const dateAfter =
  (from: () => Date | string | null, msg = 'dateAfter'): ValidatorFn =>
  (toCtrl: AbstractControl): ValidationErrors | null => {
    const start = from();
    const end   = toCtrl.value;
    if (!start || !end) return null;
    return moment(end).isBefore(moment(start), 'day') ? { [msg]: true } : null;
  };

/* ───────────────────────────────────────────
 *  CHAÎNES & N° TEL
 * ─────────────────────────────────────────── */

/** Évite les espaces en début/fin et les doubles espaces */
export const trimmed: ValidatorFn = (ctrl: AbstractControl) =>
  typeof ctrl.value === 'string' &&
  (/^\s/.test(ctrl.value) || /\s{2,}/.test(ctrl.value) || /\s$/.test(ctrl.value))
    ? { trimmed: true }
    : null;

/** Nom / prénom : uniquement lettres, tirets, apostrophes, 50 car. max */
export const personName: ValidatorFn = (ctrl: AbstractControl) =>
  new RegExp(Patterns.nom).test(ctrl.value) ? null : { personName: true };

/** Mobile algérien (ou +213…) : 10 chiffres commençant par 0 5/6/7 */
export const mobileDz: ValidatorFn = (ctrl: AbstractControl) =>
  new RegExp(Patterns.indicatifMobile).test(ctrl.value) ? null : { mobileDz: true };

/* ───────────────────────────────────────────
 *  NUMÉRIQUES
 * ─────────────────────────────────────────── */

/** Valeur ≥ `min` */
export const minValue = (min: number): ValidatorFn =>
  (ctrl: AbstractControl) =>
    ctrl.value !== null && +ctrl.value < min ? { minValue: { min } } : null;

/** Valeur ≤ `max` */
export const maxValue = (max: number): ValidatorFn =>
  (ctrl: AbstractControl) =>
    ctrl.value !== null && +ctrl.value > max ? { maxValue: { max } } : null;